(function() {
  // ============================================================================
  // 1. SETUP & INITIALIZATION
  // Initialize SVG container, tooltips, and map projection settings.
  // ============================================================================
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

  // Country name mapping dictionary to ensure data consistency
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

  // State management variables for animation and filtering
  const years = ["2023", "2024", "2025", "2026"];
  let currentActiveYear = "2026"; 
  const yearlyCounts = {};
  const yearlyRawData = {};

  // ============================================================================
  // 2. DATA LOADING & PROCESSING
  // Load GeoJSON and ranking CSV files, calculate regional university counts per year.
  // ============================================================================
  Promise.all([
    d3.json("data/countries_map.geojson"),
    d3.csv("data/cleaned_qs_ranking_2023.csv"),
    d3.csv("data/cleaned_qs_ranking_2024.csv"),
    d3.csv("data/cleaned_qs_ranking_2025.csv"),
    d3.csv("data/cleaned_qs_ranking_2026.csv")
  ]).then(([geoData, d23, d24, d25, d26]) => {
    
    const datasets = [d23, d24, d25, d26];
    let globalMaxCount = 0;

    datasets.forEach((data, index) => {
      const year = years[index];
      yearlyRawData[year] = data; 
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

    // Color scale normalized against the global maximum across all years
    const color = d3.scaleSequential()
      .domain([0, globalMaxCount])
      .interpolator(d3.interpolateReds);

    // ============================================================================
    // 3. MAP RENDERING & EVENT LISTENERS
    // Render the initial map and define hover/click interaction logic.
    // ============================================================================
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
        // Highlight clicked country
        d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);
        d3.select(this).attr("stroke", "red").attr("stroke-width", 2);

        const countryName = d.properties.NAME_EN; 
        const currentData = yearlyRawData[currentActiveYear];

        // Utility to parse ranking scores
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

        // ========================================================================
        // 4. MODAL INTERACTION
        // Populates and displays the modal with university data for the clicked region.
        // ========================================================================
        const modal = d3.select("#university-modal");
        const modalTitle = d3.select("#modal-title");
        const modalTbody = d3.select("#modal-table tbody");

        modalTitle.text(`${countryName} - ${currentActiveYear} Count (${countryUnis.length})`);
        modalTbody.selectAll("*").remove();

        if (countryUnis.length === 0) {
          modalTbody.append("tr").append("td")
            .attr("colspan", 3)
            .style("text-align", "center")
            .text("No universities ranked in this region for this year.");
        } else {
          countryUnis.sort((a, b) => a.rank - b.rank);
          const rows = modalTbody.selectAll("tr").data(countryUnis).enter().append("tr")
            .style("cursor", "pointer")
            .on("click", function(event, item) {
                // Link table interaction to highlightRow in TableApp
                d3.select("#university-modal").style("display", "none");
                d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);

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

    // ============================================================================
    // 5. EXTERNAL API
    // Exposes methods for external components (e.g., timeline) to drive map visuals.
    // ============================================================================
    window.GlobalMapApp = {
      updateMap: function(year) {
        currentActiveYear = year; 
        
        const yearLabel = d3.select("#year-label");
        if (!yearLabel.empty()) {
            yearLabel.text(year);
        }

        // Animate color changes across years
        mapPaths.transition()
          .duration(500)
          .attr("fill", d => {
            const count = yearlyCounts[year][d.properties.NAME_EN];
            return count ? color(count) : "#eee"; 
          });
      }
    };

    // ============================================================================
    // 6. MODAL CLOSING LOGIC
    // Close modal via button or clicking outside of the modal window.
    // ============================================================================
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
      console.error("Error loading map or data:", error);
  });
})();