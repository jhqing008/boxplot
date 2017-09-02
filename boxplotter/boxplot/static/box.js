var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - (margin.left + margin.right),
    height = +svg.attr("height") - (margin.top + margin.bottom);

var tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

var x = d3.scaleBand().rangeRound([0, width]).padding(0.5),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var all_data_values = []
for(var i = 0; i < data.length; i++) {
    all_data_values = all_data_values.concat(data[i].whiskers, data[i].outliers);
}

x.domain(data.map(function(d){ return d.label;}));
y.domain([d3.min(all_data_values) - 10, d3.max(all_data_values) + 10]);

g.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", "translate(0, " + height + ")")
    .call(d3.axisBottom(x));

g.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).ticks(10));

g.selectAll(".upperwhiskers")
    .data(data)
    .enter().append("line")
    .attr("class", "whisker")
    .attr("x1", function(d) { return x(d.label) + (0.15 * x.bandwidth()); })
    .attr("y1", function(d) { return y(d.whiskers[1]); })
    .attr("x2", function(d) { return x(d.label) + (0.85 * x.bandwidth()); })
    .attr("y2", function(d) { return y(d.whiskers[1]); })
    .attr("stroke", "#77dd77")
    .attr("stroke-width", 2)
    .attr("shape-rendering", "crispEdges");

g.selectAll(".lowerwhiskers")
    .data(data)
    .enter().append("line")
    .attr("x1", function(d) { return x(d.label) + (0.15 * x.bandwidth()); })
    .attr("y1", function(d) { return y(d.whiskers[0]); })
    .attr("x2", function(d) { return x(d.label) + (0.85 * x.bandwidth()); })
    .attr("y2", function(d) { return y(d.whiskers[0]); })
    .attr("stroke", "#77dd77")
    .attr("stroke-width", 2)
    .attr("shape-rendering", "crispEdges");

g.selectAll(".upperlowerwhiskers")
    .data(data)
    .enter().append("line")
    .attr("x1", function(d) { return x(d.label) + (0.5 * x.bandwidth()); })
    .attr("y1", function(d) { return y(d.whiskers[0]); })
    .attr("x2", function(d) { return x(d.label) + (0.5 * x.bandwidth()); })
    .attr("y2", function(d) { return y(d.whiskers[1]); })
    .attr("stroke", "#77dd77")
    .attr("stroke-width", 2)
    .attr("shape-rendering", "crispEdges");

g.selectAll(".iqr")
    .data(data)
    .enter().append("rect")
    .attr("class", "iqr")
    .attr("x", function(d) { return x(d.label); })
    .attr("y", function(d) { return y(d.quartiles[1]); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return y(d.quartiles[0]) - y(d.quartiles[1]); })
    .attr('fill', "rgba(255,255,255,1)")
    .attr('stroke', "#77dd77")
    .attr("stroke-width", 2)
    .attr("shape-rendering", "crispEdges")
    .on("mouseover", function(d) {      
        tooltip.transition()        
            .duration(200)   
            .style("opacity", .9);      
        tooltip.html("Upper Limit: " + d.whiskers[1] + "<br />75% Quartile: " + d.quartiles[1] + "<br />Median: " + d.median + "<br />25% Quartile: " + d.quartiles[0] + "<br />Lower Limit: " + d.whiskers[0])  
            .style("left", (d3.event.pageX) + "px")     
            .style("top", (d3.event.pageY) + "px");    
        })                  
    .on("mouseout", function(d) {       
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    });

g.selectAll(".median")
    .data(data)
    .enter().append("line")
    .attr("class", "median")
    .attr("x1", function(d) { return x(d.label); })
    .attr("y1", function(d) { return y(d.median); })
    .attr("x2", function(d) { return x(d.label) + x.bandwidth(); })
    .attr("y2", function(d) { return y(d.median); })
    .attr("stroke", "#77dd77")
    .attr("stroke-width", 2)
    .attr("shape-rendering", "crispEdges");

for(var i = 1; i < data.length; i++) {
    g.append("line")
        .attr("class", "trendlines")
        .attr("x1", x(data[i-1].label) + (0.5 * x.bandwidth()))
        .attr("y1", y(data[i-1].median))
        .attr("x2", x(data[i].label) + (0.5 * x.bandwidth()))
        .attr("y2", y(data[i].median))
        .attr("stroke", "#77dd77")
        .attr("stroke-width", 2)
        .attr("shape-rendering", "crispEdges");
}

for(var i = 0; i < data.length; i++) {
    for(var j = 0; j < data[i].outliers.length; j++) {
        g.append("circle")
            .attr("class", "outlier")
            .attr("cx", x(data[i].label) + (0.5 * x.bandwidth()))
            .attr("cy", y(data[i].outliers[j]))
            .attr("r", 5)
            .style("fill", "#779ecb");
    }

    g.append("circle")
        .attr("class", "trendline_anchor")
        .attr("cx", x(data[i].label) + (0.5 * x.bandwidth()))
        .attr("cy", y(data[i].median))
        .attr("r", 5)
        .style("fill", "#ffb347");
}