(function() {
    const features = ["ar score", "er score", "fsr score", "cpf score", "sus score"];
    const labels = ["Academic", "Employer", "Faculty", "Citations", "Sustainability"];
    const size = 300, radius = 100;

    // preprocessing
    const parseScore = (str) => {
        if (!str) return 0;
        return parseFloat(str.toString().replace(',', '.')) || 0;
    };

    // Draw radar chart comparing the first and last universities in the dataset
    window.drawComparisonRadar = function(firstUni, lastUni) {
        const container = d3.select("#radar");
        container.selectAll("*").remove();

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${size} ${size}`)
            .append("g")
            .attr("transform", `translate(${size/2}, ${size/2})`);

        const angleScale = d3.scaleLinear().domain([0, features.length]).range([0, 2 * Math.PI]);
        const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

        [25, 50, 75, 100].forEach(v => {
            svg.append("circle").attr("r", radiusScale(v)).attr("fill", "none").attr("stroke", "#eee");
        });

        // data preparation
        const dataSet = [
            { name: firstUni.name, color: "red", data: features.map(f => ({ value: parseScore(firstUni[f]) })) },
            { name: lastUni.name, color: "#999", data: features.map(f => ({ value: parseScore(lastUni[f]) })) }
        ];

        const line = d3.lineRadial()
            .angle((d, i) => angleScale(i))
            .radius(d => radiusScale(d.value))
            .curve(d3.curveLinearClosed);

        // Draw radar areas and lines
        dataSet.forEach(item => {
            svg.append("path")
                .datum(item.data)
                .attr("d", line)
                .attr("fill", item.color)
                .attr("fill-opacity", 0.3)
                .attr("stroke", item.color)
                .attr("stroke-width", 2);
        });

        // Draw axes and labels
        features.forEach((f, i) => {
            const angle = angleScale(i) - Math.PI/2;
            svg.append("line")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", Math.cos(angle) * radius)
                .attr("y2", Math.sin(angle) * radius)
                .attr("stroke", "#ddd")
                .attr("stroke-dasharray", "2,2");

            svg.append("text")
                .attr("x", Math.cos(angle) * (radius + 25))
                .attr("y", Math.sin(angle) * (radius + 25))
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .text(labels[i]);
        });

        // Legend
        const legend = container.append("div")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("gap", "20px")
            .style("font-size", "12px")
            .style("margin-top", "10px");

        dataSet.forEach(item => {
            const l = legend.append("div").style("display", "flex").style("align-items", "center");
            l.append("span").style("width", "12px").style("height", "12px")
                .style("background", item.color).style("display", "inline-block").style("margin-right", "5px");
            l.append("span").text(item.name.substring(0, 20) + "...");
        });
    };

    d3.csv("script/data.csv").then(data => {
        if (data.length > 0) {
            const first = data[0];
            const last = data[data.length - 1];
            window.drawComparisonRadar(first, last);
        }
    });
})();