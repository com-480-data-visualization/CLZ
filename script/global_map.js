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
  .style("padding", "5px")
  .style("border", "1px solid #ccc")
  .style("pointer-events", "none")
  .style("opacity", 0);

Promise.all([
  d3.json("script/ne_50m_admin_0_countries.geojson"),
  d3.csv("script/data.csv")
]).then(([geoData, data]) => {

  // map country names in CSV to those in GeoJSON
  const nameMap = {
    "Republic of Korea": "South Korea",
    "China (Mainland)": "People's Republic of China",
    "Hong Kong SAR, China": "People's Republic of China",
    "Russian Federation": "Russia"
  };

  const countryCount = {};
  const csvCountriesRaw = new Set();

  data.forEach(d => {
    let country = d["country/territory"];
    csvCountriesRaw.add(country);
    
    if (nameMap[country]) {
      country = nameMap[country];
    }
    countryCount[country] = (countryCount[country] || 0) + 1;
  });



  const projection = d3.geoNaturalEarth1()
    .fitSize([width, height], geoData);

  const path = d3.geoPath().projection(projection);

  const maxCount = d3.max(Object.values(countryCount));
  const color = d3.scaleSequential()
    .domain([0, maxCount])
    .interpolator(d3.interpolateReds);

  //Draw
  svg.selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", d => {
      const country = d.properties.NAME_EN;
      const count = countryCount[country];
      return count ? color(count) : "#eee";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
      const country = d.properties.NAME_EN;
      const count = countryCount[country] || 0;

      d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);

      tooltip.style("opacity", 1)
        .html(`<strong>${country}</strong><br>Universities: ${count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke", "#333").attr("stroke-width", 0.5);
      tooltip.style("opacity", 0);
    })
    .on("click", function(event, d) {
      d3.selectAll("path").attr("stroke", "#333").attr("stroke-width", 0.5);
      d3.select(this).attr("stroke", "red").attr("stroke-width", 2);
      console.log("Selected:", d.properties.name, "Count:", countryCount[d.properties.name] || 0);
    });
});