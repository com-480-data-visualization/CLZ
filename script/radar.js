(function() {
    const features = ["ar score", "er score", "fsr score", "cpf score", "sus score"];
    const labels = ["Academic Reputation", "Employer Reputation", "Faculty Student Ratio", "Citations per Faculty", "Sustainability"];
    
    // Increase canvas size to leave more room for labels
    const size = 500, radius = 110; 
    const centerX = size / 2;
    const centerY = size / 2;

    const parseScore = (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(/[=+\s]/g, '').replace(',', '.')) || 0;
    };

    d3.csv("data/cleaned_qs_ranking_2026.csv").then(data => {
        if (data.length === 0) return;

        const container = d3.select("#radar");
        container.selectAll("*").remove();

        // --- 1. UI Control Area (Optimized Styles) ---
        const controls = container.append("div")
            .style("display", "flex").style("flex-direction", "column")
            .style("gap", "10px").style("margin-bottom", "20px").style("width", "100%");

        const validData = data.filter(d => d.name || d["university name"]);
        
        // Styled dropdown menu container
        const createSelectBox = (label, color) => {
            const wrapper = controls.append("div")
                .style("display", "flex").style("align-items", "center")
                .style("background", "#f8f9fa").style("padding", "5px 10px")
                .style("border-radius", "6px").style("border-left", `4px solid ${color}`);
            
            wrapper.append("span").style("font-size", "12px").style("font-weight", "bold")
                .style("color", "#555").style("width", "80px").text(label); // Increased width slightly for English text
            
            const select = wrapper.append("select")
                .style("flex-grow", "1").style("border", "1px solid #ddd")
                .style("border-radius", "4px").style("padding", "4px").style("outline", "none")
                .on("change", updatePlot);
            return select;
        };

        const select1 = createSelectBox("Compare A:", "#FF4B4B");
        const select2 = createSelectBox("Compare B:", "#0083B0");

        select1.selectAll("option").data(validData).enter().append("option")
            .attr("value", d => d.name || d["university name"]).text(d => d.name || d["university name"]);
        select2.selectAll("option").data(validData).enter().append("option")
            .attr("value", d => d.name || d["university name"]).text(d => d.name || d["university name"]);

        select1.property("value", validData[0].name || validData[0]["university name"]);
        select2.property("value", validData[validData.length - 1].name || validData[validData.length - 1]["university name"]);

        // --- 2. Tooltip Initialization ---
        let tooltip = d3.select("body").select(".radar-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "radar-tooltip")
                .style("position", "absolute").style("background", "rgba(0,0,0,0.8)")
                .style("color", "white").style("padding", "8px 12px")
                .style("border-radius", "4px").style("pointer-events", "none")
                .style("font-size", "12px").style("opacity", 0).style("z-index", 1000)
                .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");
        }

        const chartContainer = container.append("div").style("width", "100%").style("display", "flex").style("justify-content", "center");

        // --- 3. Core Drawing Logic ---
        function updatePlot() {
            chartContainer.selectAll("*").remove();

            const uni1Name = select1.property("value");
            const uni2Name = select2.property("value");
            const firstUni = validData.find(d => (d.name || d["university name"]) === uni1Name);
            const lastUni = validData.find(d => (d.name || d["university name"]) === uni2Name);

            if (!firstUni || !lastUni) return;

            const svg = chartContainer.append("svg")
                .attr("viewBox", `0 0 ${size} ${size}`)
                .style("max-width", "500px")
                .append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);

            // --- Define advanced SVG filters and gradients (for professional look) ---
            const defs = svg.append("defs");

            // Glow filter
            const filter = defs.append("filter").attr("id", "glow");
            filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // Color theme
            const theme = [
                { id: "gradA", color: "#FF4B4B", fill: "rgba(255, 75, 75, 0.2)" }, // Modern Coral Red
                { id: "gradB", color: "#0083B0", fill: "rgba(0, 131, 176, 0.2)" }  // Modern Deep Sea Blue
            ];

            const angleScale = d3.scaleLinear().domain([0, features.length]).range([0, 2 * Math.PI]);
            const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

            // --- Draw Spider Web Background ---
            const ticks = [20, 40, 60, 80, 100];
            ticks.forEach(tick => {
                const levelFactor = radiusScale(tick);
                // Connect points with lines to form polygons
                svg.selectAll(`.grid-level-${tick}`).data(features).enter().append("line")
                    .attr("x1", (d, i) => levelFactor * Math.cos(angleScale(i) - Math.PI/2))
                    .attr("y1", (d, i) => levelFactor * Math.sin(angleScale(i) - Math.PI/2))
                    .attr("x2", (d, i) => levelFactor * Math.cos(angleScale(i+1) - Math.PI/2))
                    .attr("y2", (d, i) => levelFactor * Math.sin(angleScale(i+1) - Math.PI/2))
                    .attr("stroke", "#e2e2e2").attr("stroke-dasharray", "3,3").attr("stroke-width", 1);
            });

            // Draw center axes and labels
            features.forEach((f, i) => {
                const angle = angleScale(i) - Math.PI/2;
                
                // Axis line
                svg.append("line")
                    .attr("x1", 0).attr("y1", 0)
                    .attr("x2", radius * Math.cos(angle))
                    .attr("y2", radius * Math.sin(angle))
                    .attr("stroke", "#d0d0d0").attr("stroke-width", 1);

                // Labels (Dynamically adjust anchor based on position to prevent text cropping)
                const labelX = (radius + 25) * Math.cos(angle);
                const labelY = (radius + 25) * Math.sin(angle);
                let anchor = "middle";
                if (Math.abs(angle + Math.PI/2) < 0.1) anchor = "middle"; // Top
                else if (Math.cos(angle) > 0) anchor = "start"; // Right
                else anchor = "end"; // Left

                svg.append("text")
                    .attr("x", labelX).attr("y", labelY).attr("dy", "0.35em")
                    .attr("text-anchor", anchor).style("font-size", "15px")
                    .style("font-weight", "600").style("fill", "#555")
                    .text(labels[i]);
            });

            // --- Prepare plotting data ---
            const dataSet = [
                { name: firstUni.name || firstUni["university name"], theme: theme[0], values: features.map(f => parseScore(firstUni[f])) },
                { name: lastUni.name || lastUni["university name"], theme: theme[1], values: features.map(f => parseScore(lastUni[f])) }
            ];

            const line = d3.lineRadial().angle((d, i) => angleScale(i)).radius(d => radiusScale(d)).curve(d3.curveLinearClosed);

            // --- Draw radar coverage areas and vertices ---
            dataSet.forEach((item, index) => {
                // 1. Draw semi-transparent glowing area
                svg.append("path")
                    .datum(item.values)
                    .attr("d", line)
                    .attr("fill", item.theme.fill)
                    .attr("stroke", item.theme.color)
                    .attr("stroke-width", 2.5)
                    .style("filter", "url(#glow)") // Apply glow effect
                    .style("transition", "all 0.5s ease");

                // 2. Draw interactive data vertices (Dots)
                item.values.forEach((val, i) => {
                    const angle = angleScale(i) - Math.PI/2;
                    svg.append("circle")
                        .attr("cx", radiusScale(val) * Math.cos(angle))
                        .attr("cy", radiusScale(val) * Math.sin(angle))
                        .attr("r", 4)
                        .attr("fill", "white")
                        .attr("stroke", item.theme.color)
                        .attr("stroke-width", 2)
                        .style("cursor", "pointer")
                        .on("mouseover", function(event) {
                            d3.select(this).transition().duration(200).attr("r", 7).attr("fill", item.theme.color);
                            tooltip.style("opacity", 1)
                                .html(`<strong>${item.name}</strong><br/>${labels[i]}: <span style="color:#FFD700">${val.toFixed(1)}</span>`);
                        })
                        .on("mousemove", function(event) {
                            tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
                        })
                        .on("mouseout", function() {
                            d3.select(this).transition().duration(200).attr("r", 4).attr("fill", "white");
                            tooltip.style("opacity", 0);
                        });
                });
            });
        }

        updatePlot();

        // API exposed for external calls (e.g., Table, Scatter Plot) ---
        window.RadarApp = {
            selectUniversity: function(uniName, slot) {
                // slot 1 represents Red side (Select1), slot 2 represents Blue side (Select2)
                if (slot === 1) {
                    select1.property("value", uniName);
                } else if (slot === 2) {
                    select2.property("value", uniName);
                }
                
                // Key: After modifying the dropdown value, manually call the redraw function once
                updatePlot();

                // UX Optimization: Scroll smoothly to the radar chart area after clicking compare so the user immediately sees the change
                const radarSection = document.getElementById("radar-section"); // updated to match new HTML ID
                if (radarSection) {
                    radarSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
        };
    });
})();