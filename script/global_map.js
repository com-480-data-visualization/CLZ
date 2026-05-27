(function() {
  const container = d3.select("#map").node();
  let width = container.getBoundingClientRect().width;
  let height = width * 0.5;

  const svg = d3.select("#map")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("box-shadow", "0 2px 5px rgba(0,0,0,0.1)")
    .style("opacity", 0)
    .style("z-index", 1000);

  // 完善的国家名称映射字典
  const nameMap = {
    "Republic of Korea": "South Korea",
    "South Korea": "South Korea",
    "China (Mainland)": "People's Republic of China",
    "Mainland China": "People's Republic of China",
    "Hong Kong SAR, China": "People's Republic of China",
    "Russian Federation": "Russia",
    "UK": "United Kingdom",
    "USA": "United States of America",
    "United States": "United States of America"
  };

  // === 动画与多数据管理变量 ===
  const years = ["2023", "2024", "2025", "2026"];
  let currentActiveYear = "2026"; // 默认显示的年份
  const yearlyCounts = {};
  const yearlyRawData = {};

  // 并行加载 GeoJSON 和 4 个年份的 CSV
  Promise.all([
    d3.json("data/countries_map.geojson"),
    d3.csv("data/cleaned_qs_ranking_2023.csv"),
    d3.csv("data/cleaned_qs_ranking_2024.csv"),
    d3.csv("data/cleaned_qs_ranking_2025.csv"),
    d3.csv("data/cleaned_qs_ranking_2026.csv")
  ]).then(([geoData, d23, d24, d25, d26]) => {
    
    // 1. 数据预处理：计算每年的国家上榜数量，并寻找 4 年间的全局最大值
    const datasets = [d23, d24, d25, d26];
    let globalMaxCount = 0;

    datasets.forEach((data, index) => {
      const year = years[index];
      yearlyRawData[year] = data; // 保存该年的原始数据供点击弹窗使用
      const countDict = {};

      data.forEach(d => {
        let country = d["country/territory"] || d["country"] || "";
        if (nameMap[country]) country = nameMap[country];
        countDict[country] = (countDict[country] || 0) + 1;
      });

      yearlyCounts[year] = countDict;
      
      const yearMax = d3.max(Object.values(countDict));
      if (yearMax > globalMaxCount) globalMaxCount = yearMax;
    });

    const projection = d3.geoNaturalEarth1().fitSize([width, height], geoData);
    const path = d3.geoPath().projection(projection);

    // 比例尺使用 globalMaxCount，确保跨年份颜色标准绝对一致
    const color = d3.scaleSequential()
      .domain([0, globalMaxCount])
      .interpolator(d3.interpolateReds);

    // 2. 初始绘制地图 (默认年份 2026)
    const mapPaths = svg.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const country = d.properties.NAME_EN;
        const count = yearlyCounts[currentActiveYear][country]; 
        return count ? color(count) : "#eee";
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        const country = d.properties.NAME_EN;
        const count = yearlyCounts[currentActiveYear][country] || 0;

        d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);

        tooltip.style("opacity", 1)
          .html(`<strong>${country}</strong><br>Year: ${currentActiveYear}<br>Universities: ${count}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 0.5);
        tooltip.style("opacity", 0);
      })
      .on("click", function(event, d) {
        // 视觉高亮
        d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);
        d3.select(this).attr("stroke", "red").attr("stroke-width", 2);

        const countryName = d.properties.NAME_EN; 
        
        // 核心修改：使用当前活跃年份的原始数据进行过滤
        const currentData = yearlyRawData[currentActiveYear];

        // 过滤分数（去除 =, +, 和区间）的工具函数
        const parseScore = (str) => {
            if (!str) return 0;
            return parseFloat(str.toString().replace(/[=+\s]/g, '').replace(',', '.')) || 0;
        };

        const countryUnis = currentData.map(u => {
          let csvCountry = u["country/territory"] || u["country"] || "";
          if (nameMap[csvCountry]) csvCountry = nameMap[csvCountry]; 
          return {
            rank: parseScore(u["rank"] || u["rank (#)"]),
            name: u["name"] || u["university name"] || "",
            country: csvCountry,
            overall: parseScore(u["overall score"])
          };
        }).filter(u => u.country === countryName); 

        // 弹窗渲染
        const modal = d3.select("#university-modal");
        const modalTitle = d3.select("#modal-title");
        const modalTbody = d3.select("#modal-table tbody");

        modalTitle.text(`${countryName} - ${currentActiveYear} Total number (${countryUnis.length})`);
        modalTbody.selectAll("*").remove();

        if (countryUnis.length === 0) {
          modalTbody.append("tr").append("td")
            .attr("colspan", 3)
            .style("text-align", "center")
            .text("该国家该年份暂无大学上榜");
        } else {
          countryUnis.sort((a, b) => a.rank - b.rank);
          const rows = modalTbody.selectAll("tr").data(countryUnis).enter().append("tr")
            .style("cursor", "pointer") // 变成小手图标，提示可点击
            .on("click", function(event, item) {
                // 1. 关闭当前的地图弹窗，给表格让出视野
                d3.select("#university-modal").style("display", "none");
                // 恢复地图被点击国家的高亮状态
                d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);

                // 2. 呼叫 TableApp 执行滚动和闪烁高亮
                if (window.TableApp) {
                    window.TableApp.highlightRow(item.name);
                }
            });

          rows.append("td").text(item => item.rank > 0 ? item.rank : "-");
          rows.append("td").text(item => item.name);
          rows.append("td").text(item => item.overall > 0 ? item.overall.toFixed(1) : "-");
        }
        modal.style("display", "block");
      });

    // === 3. 暴露给外部 timeline.js 使用的 API ===
    window.GlobalMapApp = {
      updateMap: function(year) {
        currentActiveYear = year; 
        
        // 更新背景年份水印（如果你的 HTML 结构里有加）
        const yearLabel = d3.select("#year-label");
        if (!yearLabel.empty()) {
            yearLabel.text(year);
        }

        // D3 颜色平滑过渡动画
        mapPaths.transition()
          .duration(500)
          .attr("fill", d => {
            const count = yearlyCounts[year][d.properties.NAME_EN];
            return count ? color(count) : "#eee"; 
          });
      }
    };

    // === 4. 弹窗关闭逻辑 ===
    d3.select(".close-btn").on("click", () => {
      d3.select("#university-modal").style("display", "none");
      d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);
    });

    window.addEventListener("click", function(event) {
      const modal = document.getElementById("university-modal");
      if (event.target === modal) {
        modal.style.display = "none";
        d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);
      }
    });
    
  }).catch(error => {
      console.error("地图加载或数据处理出错:", error);
  });
})();