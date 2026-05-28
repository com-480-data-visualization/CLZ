(function() {
    // Load the dataset for the scatter plot
    d3.csv("data/cleaned_qs_ranking_2026.csv").then(data => {
        const container = d3.select("#scatter");
        const width = 500, height = 350, margin = {top: 40, right: 30, bottom: 50, left: 60};
        
        container.selectAll("*").remove();

        const metrics = [
            { key: "overall score", label: "Overall Score" },
            { key: "ar score", label: "Academic Reputation" },
            { key: "er score", label: "Employer Reputation" },
            { key: "fsr score", label: "Faculty Student Ratio" },
            { key: "cpf score", label: "Citations per Faculty" },
            { key: "ifr score", label: "International Faculty Ratio" },
            { key: "isr score", label: "International Student Ratio" },
            { key: "irn score", label: "International Research Network" },
            { key: "eo score", label: "Employment Outcomes" },
            { key: "sus score", label: "Sustainability" }
        ];

        let currentX = "ar score";
        let currentY = "overall score";

        // Playback State for X-Axis Animation
        let isPlaying = false;
        let playTimer;
        let currentMetricIndex = metrics.findIndex(m => m.key === currentX);

        const controls = container.append("div")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("gap", "15px")
            .style("margin-bottom", "15px");

        // Standardized play button styling (defaults to red Play)
        const playBtn = controls.append("button")
            .html("▶ Play Metrics")
            .style("padding", "6px 14px")
            .style("border", "none")
            .style("border-radius", "6px")
            .style("background-color", "#dc3545")
            .style("color", "white")
            .style("font-weight", "bold")
            .style("cursor", "pointer")
            .style("transition", "background-color 0.2s ease")
            .on("click", togglePlay);

        const xControl = controls.append("div");
        xControl.append("label").text("X-Axis: ").style("font-size", "13px").style("font-weight", "600").style("color", "#475569");
        const xSelect = xControl.append("select")
            .style("margin-left", "5px").style("padding", "4px").style("border-radius", "4px").style("border", "1px solid #cbd5e1")
            .on("change", function() {
                if (isPlaying) stopPlayback(); 
                currentX = this.value;
                currentMetricIndex = metrics.findIndex(m => m.key === currentX);
                updatePlot(); 
            });
        
        xSelect.selectAll("option").data(metrics).enter().append("option")
            .attr("value", d => d.key).text(d => d.label).property("selected", d => d.key === currentX);

        const yControl = controls.append("div");
        yControl.append("label").text("Y-Axis: ").style("font-size", "13px").style("font-weight", "600").style("color", "#475569");
        const ySelect = yControl.append("select")
            .style("margin-left", "5px").style("padding", "4px").style("border-radius", "4px").style("border", "1px solid #cbd5e1")
            .on("change", function() {
                if (isPlaying) stopPlayback(); 
                currentY = this.value;
                updatePlot(); 
            });

        ySelect.selectAll("option").data(metrics).enter().append("option")
            .attr("value", d => d.key).text(d => d.label).property("selected", d => d.key === currentY);

        function stepMetric() {
            currentMetricIndex++;
            if (currentMetricIndex >= metrics.length) {
                currentMetricIndex = 0; 
            }

            if (metrics[currentMetricIndex].key === currentY) {
                currentMetricIndex++;
                if (currentMetricIndex >= metrics.length) currentMetricIndex = 0;
            }

            currentX = metrics[currentMetricIndex].key;
            xSelect.property("value", currentX); 
            updatePlot();
        }

        // Play/Pause button styling toggle logic
        function stopPlayback() {
            isPlaying = false;
            playBtn.html("▶ Play Metrics").style("background-color", "#dc3545");
            clearInterval(playTimer);
        }

        function togglePlay() {
            if (isPlaying) {
                stopPlayback();
            } else {
                isPlaying = true;
                playBtn.html("⏸ Pause").style("background-color", "#333");
                playTimer = setInterval(stepMetric, 2500); 
                stepMetric(); 
            }
        }

        const parseScore = (str) => {
            if (!str) return 0;
            return parseFloat(str.toString().replace(/[=+\s]/g, '').replace(',', '.')) || 0;
        };

        const cleanData = data.map(d => {
            let obj = { name: d.name || d["university name"] || "Unknown" };
            metrics.forEach(m => obj[m.key] = parseScore(d[m.key]));
            return obj;
        }).filter(d => d["overall score"] > 0); 

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`);

        const x = d3.scaleLinear().range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

        const xAxisGroup = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
        const yAxisGroup = svg.append("g").attr("transform", `translate(${margin.left},0)`);

        const xLabel = svg.append("text").attr("class", "axis-label")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2).attr("y", height - 10).attr("text-anchor", "middle")
            .style("font-size", "12px").style("font-weight", "bold").style("fill", "#475569");

        const yLabel = svg.append("text").attr("class", "axis-label")
            .attr("transform", "rotate(-90)").attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2)).attr("y", 20).attr("text-anchor", "middle")
            .style("font-size", "12px").style("font-weight", "bold").style("fill", "#475569");

        let tooltip = d3.select("body").select(".scatter-tooltip");
        if (tooltip.empty()) tooltip = d3.select("body").append("div").attr("class", "scatter-tooltip");

        const circles = svg.selectAll("circle").data(cleanData).enter().append("circle")
            .attr("r", 4).attr("opacity", 0.6).attr("cx", margin.left).attr("cy", height - margin.bottom)
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(100).attr("opacity", 1).attr("r", 7).attr("stroke", "#333");
                const xName = metrics.find(m => m.key === currentX).label;
                const yName = metrics.find(m => m.key === currentY).label;
                tooltip.style("opacity", 1).html(`<strong>${d.name}</strong><br/>${yName}: ${d[currentY].toFixed(1)}<br/>${xName}: ${d[currentX].toFixed(1)}`);
            })
            .on("mousemove", function(event) { tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px"); })
            .on("mouseout", function() {
                d3.select(this).transition().duration(100).attr("opacity", 0.6).attr("r", 4).attr("stroke", "none");
                tooltip.style("opacity", 0);
            })
            .on("click", function(event, d) {
                if (isPlaying) stopPlayback();
                if (window.TableApp) window.TableApp.highlightRow(d.name, "2026");
            });

        function updatePlot() {
            const xExtent = d3.extent(cleanData, d => d[currentX]);
            const yExtent = d3.extent(cleanData, d => d[currentY]);
            
            x.domain([Math.max(0, xExtent[0] - 5), Math.min(100, xExtent[1] + 5)]);
            y.domain([Math.max(0, yExtent[0] - 5), Math.min(100, yExtent[1] + 5)]);

            const colorScale = d3.scaleLinear().domain([yExtent[0], yExtent[1]]).range(["#FFC107", "#D32F2F"]);   

            xAxisGroup.transition().duration(800).call(d3.axisBottom(x).ticks(6));
            yAxisGroup.transition().duration(800).call(d3.axisLeft(y).ticks(6));

            xLabel.text(metrics.find(m => m.key === currentX).label);
            yLabel.text(metrics.find(m => m.key === currentY).label);

            circles.transition().duration(800)
                .attr("cx", d => x(d[currentX]))
                .attr("cy", d => y(d[currentY]))
                .attr("fill", d => colorScale(d[currentY])); 
        }

        updatePlot();

        // Auto-play scatter plot animation on page load
        setTimeout(() => {
            if (!isPlaying) togglePlay();
        }, 1500); // Delay for 1.5 seconds to allow page rendering to stabilize before starting
    });
})();