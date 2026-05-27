(function() {
    let currentYear = "2026";
    let showMoreColumns = false;
    let sortKey = "rank";
    let isAscending = true;
    let rawDataByYear = {};
    let activeData = [];

    // --- Table Playback State ---
    let tablePlaying = false;
    let tableTimer;
    const availableYears = ["2023", "2024", "2025", "2026"];

    // Core and Extended Column Definitions
    const baseColumns = [
        { label: "Rank (#)", key: "rank", isNumeric: true },
        { label: "University Name", key: "name", isNumeric: false },
        { label: "Country/Region", key: "country", isNumeric: false },
        { label: "Overall Score", key: "overall", isNumeric: true }
    ];

    const extendedColumns = [
        { label: "Academic Reputation (AR)", key: "ar", isNumeric: true },
        { label: "Employer Reputation (ER)", key: "er", isNumeric: true },
        { label: "Faculty Student Ratio (FSR)", key: "fsr", isNumeric: true },
        { label: "Citations per Faculty (CPF)", key: "cpf", isNumeric: true },
        { label: "Intl. Faculty Ratio (IFR)", key: "ifr", isNumeric: true },
        { label: "Intl. Student Ratio (ISR)", key: "isr", isNumeric: true },
        { label: "Intl. Research Network (IRN)", key: "irn", isNumeric: true },
        { label: "Employment Outcomes (EO)", key: "eo", isNumeric: true },
        { label: "Sustainability (SUS)", key: "sus", isNumeric: true }
    ];

    const COUNTRY_MAP = {
        "United States": "United States of America",
        "Hong Kong SAR": "Hong Kong SAR, China",
        "Russia": "Russia Federation",
        "South Korea": "Republic of Korea",
    };
      
    const parseScore = (str) => {
        if (!str || str.trim() === "" || str === "-") return 0;
        let cleanedStr = str.toString().replace(/[=+\s]/g, '').replace(',', '.');
        return parseFloat(cleanedStr) || 0;
    };

    function stepTable() {
        let currentIndex = availableYears.indexOf(currentYear);
        currentIndex++;
        if (currentIndex >= availableYears.length) {
            currentIndex = 0; 
        }
        window.TableApp.setYear(availableYears[currentIndex]);
    }

    // --- 统一播放按钮样式切换逻辑 ---
    function stopTablePlayback() {
        tablePlaying = false;
        // 停止时变红
        d3.select("#table-play-btn")
            .html("▶ Play")
            .style("background-color", "#dc3545")
            .style("color", "white")
            .style("border", "none"); 
        clearInterval(tableTimer);
    }

    function startTablePlayback() {
        tablePlaying = true;
        // 播放时变黑
        d3.select("#table-play-btn")
            .html("⏸ Pause")
            .style("background-color", "#333")
            .style("color", "white")
            .style("border", "none");
        tableTimer = setInterval(stepTable, 1800); 
        stepTable(); 
    }

    // Load CSVs
    Promise.all([
        d3.csv("data/cleaned_qs_ranking_2023.csv"),
        d3.csv("data/cleaned_qs_ranking_2024.csv"),
        d3.csv("data/cleaned_qs_ranking_2025.csv"),
        d3.csv("data/cleaned_qs_ranking_2026.csv")
    ]).then(([data2023, data2024, data2025, data2026]) => {
        rawDataByYear["2023"] = data2023;
        rawDataByYear["2024"] = data2024;
        rawDataByYear["2025"] = data2025;
        rawDataByYear["2026"] = data2026;

        // 手动初始化一次按钮样式为红色 Play
        d3.select("#table-play-btn")
            .style("background-color", "#dc3545")
            .style("color", "white")
            .style("border", "none");

        d3.selectAll(".year-btn[data-year]").on("click", function() {
            if (tablePlaying) stopTablePlayback(); 

            currentYear = d3.select(this).attr("data-year");
            d3.selectAll(".year-btn[data-year]").classed("active", false);
            d3.select(this).classed("active", true);
            processAndSortData();
        });

        d3.select("#toggle-columns-btn").on("click", function() {
            showMoreColumns = !showMoreColumns;
            d3.select(this).text(showMoreColumns ? "Hide Metrics ⇅" : "Show All Metrics ⇅");
            renderHeader();
            renderBody();
        });

        d3.select("#table-search").on("input", function(event) {
            const keyword = event.target.value.toLowerCase();
            const filtered = activeData.filter(d => 
                d.name.toLowerCase().includes(keyword) || 
                d.country.toLowerCase().includes(keyword)
            );
            renderBody(filtered);
        });

        d3.select("#table-play-btn").on("click", function() {
            if (tablePlaying) {
                stopTablePlayback();
            } else {
                startTablePlayback();
            }
        });

        processAndSortData();

        // === 新增：页面加载后自动播放表格动画 ===
        setTimeout(() => {
            if (!tablePlaying) startTablePlayback();
        }, 1000); // 给地图一点优先权，1秒后表格开始动画
    });

    function processAndSortData(skipAnimation = false) {
        const yearData = rawDataByYear[currentYear] || [];
        activeData = yearData.map(d => {
            let rawCountry = d["country/territory"] || d["country"] || "";
            let cleanCountry = COUNTRY_MAP[rawCountry] || rawCountry;
            return {
                rank: parseScore(d["rank"]) || parseScore(d["rank (#)"]),
                name: d["name"] || d["university name"] || "",
                country: cleanCountry, 
                overall: parseScore(d["overall score"]),
                ar: parseScore(d["ar score"]),
                er: parseScore(d["er score"]),
                fsr: parseScore(d["fsr score"]),
                cpf: parseScore(d["cpf score"]),
                ifr: parseScore(d["ifr score"]),
                isr: parseScore(d["isr score"]),
                irn: parseScore(d["irn score"]),
                eo: parseScore(d["eo score"]),
                sus: parseScore(d["sus score"])
            };
        });

        executeSort();
        renderHeader();
        renderBody(null, skipAnimation);
    }

    function executeSort() {
        const currentColumns = [...baseColumns, ...extendedColumns];
        const activeColumnConfig = currentColumns.find(c => c.key === sortKey);
        const isNumeric = activeColumnConfig ? activeColumnConfig.isNumeric : true;

        activeData.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            if (isNumeric) {
                return isAscending ? valA - valB : valB - valA;
            } else {
                return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
        });
    }

    function renderHeader() {
        let columns = showMoreColumns ? [...baseColumns, ...extendedColumns] : baseColumns;
        const displayColumns = [...columns, { label: "Compare in radar", key: "action", isNumeric: false }];

        const tr = d3.select("#data-table thead tr");
        tr.selectAll("*").remove();

        const headers = tr.selectAll("th").data(displayColumns).enter().append("th");
        
        headers.html(d => {
            if (d.key === "action") return d.label; 
            if (d.key === sortKey) return `<span style="color:#e74c3c">${d.label} ${isAscending ? "▲" : "▼"}</span>`;
            return `${d.label} ⇅`;
        })
        .style("cursor", d => d.key === "action" ? "default" : "pointer")
        .attr("class", d => d.key === sortKey ? "sorted-column" : "")
        .on("click", (event, d) => {
            if (d.key === "action") return; 
            if (sortKey === d.key) {
                isAscending = !isAscending;
            } else {
                sortKey = d.key;
                isAscending = (d.key === "rank");
            }
            executeSort();
            renderHeader(); 
            renderBody();
        });
    }

    function renderBody(dataToRender, skipAnimation = false) {
        const list = dataToRender || activeData;
        const columns = showMoreColumns ? [...baseColumns, ...extendedColumns] : baseColumns;
        const tbody = d3.select("#data-table tbody");

        if (list.length === 0) {
            tbody.selectAll("*").remove();
            tbody.append("tr").append("td")
                .attr("colspan", columns.length + 1)
                .style("text-align", "center")
                .text("No universities found.");
            return;
        }

        const oldPositions = new Map();
        tbody.selectAll("tr").each(function(d) {
            if (d && d.name) {
                oldPositions.set(d.name, this.getBoundingClientRect().top);
            }
        });

        const rows = tbody.selectAll("tr").data(list, d => d.name);
        rows.exit().remove();
        const rowsEnter = rows.enter().append("tr").style("opacity", 0);
        const rowsMerge = rowsEnter.merge(rows);
        
        rowsMerge.order();

        rowsMerge.each(function(rowData) {
            const rowSelection = d3.select(this);
            rowSelection.selectAll("*").remove(); 

            columns.forEach(col => {
                let value = rowData[col.key];
                if (col.isNumeric && col.key !== "rank") {
                    value = value > 0 ? value.toFixed(1) : "-";
                }
                rowSelection.append("td").text(value);
            });

            const actionTd = rowSelection.append("td").style("white-space", "nowrap").style("vertical-align", "middle");
            const btnGroup = actionTd.append("div").attr("class", "compare-btn-group");

            btnGroup.append("button").attr("class", "compare-btn btn-red")
                .html("<span class='btn-dot' style='background:#d32f2f;'></span>Red")
                .on("click", function(event) {
                    event.stopPropagation(); 
                    if (window.RadarApp) window.RadarApp.selectUniversity(rowData.name, 1);
                });

            btnGroup.append("button").attr("class", "compare-btn btn-blue")
                .html("<span class='btn-dot' style='background:#0288d1;'></span>Blue") 
                .on("click", function(event) {
                    event.stopPropagation(); 
                    if (window.RadarApp) window.RadarApp.selectUniversity(rowData.name, 2);
                });
        });

        rowsMerge.each(function(d, i) { 
            const node = this;
            const newY = node.getBoundingClientRect().top; 
            const oldY = oldPositions.get(d.name);
            
            if (skipAnimation || i >= 10) {
                d3.select(node)
                  .style("transform", "translateY(0px)")
                  .style("opacity", 1)
                  .style("position", null)
                  .style("z-index", null)
                  .style("background-color", null)
                  .style("color", null)
                  .style("box-shadow", "none");
                return; 
            }

            const staggerDelay = i * 80; 

            if (oldY !== undefined && oldY !== newY) {
                const deltaY = oldY - newY;
                
                d3.select(node)
                  .style("transform", `translateY(${deltaY}px)`)
                  .style("position", "relative") 
                  .style("z-index", "100") 
                  .style("box-shadow", "0 12px 24px rgba(211, 47, 47, 0.2)") 
                  .style("background-color", "#ffebee") 
                  .style("color", "#d32f2f") 
                  .style("opacity", 1);
                
                d3.select(node)
                  .transition()
                  .delay(staggerDelay) 
                  .duration(2500) 
                  .ease(d3.easeBackOut.overshoot(1.2)) 
                  .style("transform", "translateY(0px)")
                  .style("background-color", "#ffffff") 
                  .style("color", "#475569") 
                  .style("box-shadow", "none") 
                  .on("end", function() {
                      d3.select(this)
                        .style("position", null)
                        .style("z-index", null)
                        .style("background-color", null)
                        .style("color", null);
                  });

            } else if (oldY === undefined) {
                d3.select(node)
                  .style("transform", "translateY(30px)")
                  .style("opacity", 0)
                  .transition()
                  .delay(staggerDelay) 
                  .duration(700)
                  .ease(d3.easeCubicOut)
                  .style("transform", "translateY(0px)")
                  .style("opacity", 1);
            } else {
                d3.select(node)
                  .style("opacity", 1)
                  .style("transform", "translateY(0px)");
            }
        });
    }

    window.TableApp = {
        pause: function() {
            if (typeof tablePlaying !== 'undefined' && tablePlaying) {
                stopTablePlayback(); 
            }
        },

        highlightRow: function(universityName, targetYear) {
            this.pause();
            if (window.MapTimelineApp) window.MapTimelineApp.pause();

            if (targetYear && targetYear !== currentYear) {
                this.setYear(targetYear, true); 
            }

            setTimeout(() => {
                const searchInput = d3.select("#table-search");
                if (searchInput.property("value") !== "") {
                    searchInput.property("value", "");
                    searchInput.node().dispatchEvent(new Event("input")); 
                }

                const rows = d3.select("#data-table tbody").selectAll("tr");
                let targetNode = null;
                
                rows.each(function(d) {
                    if (d && d.name === universityName) {
                        targetNode = this;
                    }
                });

                if (targetNode) {
                    targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
                    
                    d3.select(targetNode)
                      .style("background-color", "#ffeb3b") 
                      .transition()
                      .duration(2000)
                      .style("background-color", null);
                }
            }, 80);
        },
        
        setYear: function(year, skipAnimation = false) {
            currentYear = year.toString();
            d3.selectAll(".year-btn[data-year]").classed("active", false);
            d3.selectAll(".year-btn[data-year]").filter(function() { 
                return d3.select(this).attr("data-year") === currentYear; 
            }).classed("active", true);
            
            processAndSortData(skipAnimation);
        }
    };
})();