(function() {
    d3.csv("script/data.csv").then(data => {
        const container = d3.select("#scatter");
        const width = 500, height = 350, margin = {top: 30, right: 30, bottom: 50, left: 60};
        
        container.selectAll("*").remove();
        const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);

        // preprocessing
        const parseScore = (str) => {
            if (!str) return 0;
            return parseFloat(str.toString().replace(',', '.')) || 0;
        };
        // academic reputation (AR score) vs overall score
        const cleanData = data.map(d => ({
            name: d.name,
            ar: parseScore(d["ar score"]),
            overall: parseScore(d["overall score"])
        }));

        const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
        const y = d3.scaleLinear().domain([50, 100]).range([height - margin.bottom, margin.top]);

        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5));

        const yAxis = svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5));


        // X-axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Academic Reputation (AR Score)");

        // Y-axis label
        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text("Overall Score");

        // hover interaction
        let tooltip = d3.select("body").select(".scatter-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "scatter-tooltip")
                .style("position", "absolute").style("background", "white").style("padding", "8px")
                .style("border", "1px solid #ccc").style("border-radius", "4px")
                .style("pointer-events", "none").style("font-size", "12px").style("opacity", 0);
        }

        svg.selectAll("circle")
            .data(cleanData)
            .enter().append("circle")
            .attr("cx", d => x(d.ar))
            .attr("cy", d => y(d.overall))
            .attr("r", 4)
            .attr("fill", "red")
            .attr("opacity", 0.4)
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(100).attr("opacity", 1).attr("r", 7);
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.name}</strong><br/>Overall: ${d.overall.toFixed(1)}<br/>AR: ${d.ar.toFixed(1)}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).transition().duration(100).attr("opacity", 0.4).attr("r", 4);
                tooltip.style("opacity", 0);
            });
    });
})();