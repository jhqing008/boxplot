var svg = d3.select("svg"),
    svg_width = +svg.attr("width"),
    svg_height = +svg.attr("height"),
    margin = {top: 70, right: 20, bottom: 20, left: 30},
    width = +svg.attr("width") - (margin.left + margin.right),
    height = +svg.attr("height") - (margin.top + margin.bottom),
    tooltip_boxplot = d3.select("body").append("div").attr("id", "tooltip_boxplot").style("opacity", 0);
    tooltip_outlier = d3.select("body").append("div").attr("id", "tooltip_outlier").style("opacity", 0);

var extreme_values = [];
for(var i = 0; i < data.length; i++) {
    extreme_values = extreme_values.concat(data[i].whiskers, data[i].outliers);
}

var x = d3.scaleBand().rangeRound([0, width]).padding(0.75).domain(data.map(function(d){ return d.label; }));
    y = d3.scaleLinear().rangeRound([height, 0]).domain([d3.min(extreme_values) - 10, d3.max(extreme_values) + 10]);

var boxplot_color = d3.scaleOrdinal(d3.schemeCategory10).domain([+data[0].label, +data[data.length - 1].label]);

var chart_properties = {
    title: "Shampoo Sales by Year",
    axis_labels: {x: "year", y: "sales"}
}

var canvas_background = svg.append("rect")
    .attr("class", "background")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", +svg.attr("width"))
    .attr("height", +svg.attr("height"));

var title = svg.append("text").text(chart_properties.title)
    .attr("x", svg_width/2)
    .attr("y", 30)
    .attr("class", "title");

// Build Legend.
var legend = {
    canvas: svg.append("g"),
    location: {x: width-110, y: 20},
    dimensions: {width: 110, height: 90},
    contents: {}
};

legend.contents.background = legend.canvas.append("rect");
legend.contents.title = legend.canvas.append("text").text("Legend");

legend.contents.median = {canvas: legend.canvas.append("g"), contents: {}};
legend.contents.median.contents.indicator_line = legend.contents.median.canvas.append("line");
legend.contents.median.contents.indicator_circle = legend.contents.median.canvas.append("circle");
legend.contents.median.contents.title = legend.contents.median.canvas.append("text").text("Median");

legend.contents.whiskers = {canvas: legend.canvas.append("g"), contents: {}};
legend.contents.whiskers.contents.indicator_line = legend.contents.whiskers.canvas.append("line");
legend.contents.whiskers.contents.title = legend.contents.whiskers.canvas.append("text").text("Whiskers");

legend.contents.outliers = {canvas: legend.canvas.append("g"), contents: {}};
legend.contents.outliers.contents.indicator_circle = legend.contents.outliers.canvas.append("circle");
legend.contents.outliers.contents.title = legend.contents.outliers.canvas.append("text").text("Outliers");

legend.canvas
    .attr("transform", "translate(" + legend.location.x + "," + legend.location.y + ")")
    .attr("class", "legend");

legend.contents.background
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legend.dimensions.width)
    .attr("height", legend.dimensions.height)
    .attr("class", "background");

legend.contents.title
    .attr("x", legend.dimensions.width/2)
    .attr("y", 15)
    .attr("text-anchor", "middle");

legend.contents.median.contents.indicator_line
    .attr("x1", 5)
    .attr("y1", 35)
    .attr("x2", 30)
    .attr("y2", 35)
    .attr("class", "median-line");

legend.contents.median.contents.indicator_circle
    .attr("cx", 17)
    .attr("cy", 35)
    .attr("class", "median-circle");

legend.contents.median.contents.title
    .attr("x", 35)
    .attr("y", 35)
    .attr("dy", "0.3em");

legend.contents.whiskers.contents.indicator_line
    .attr("x1", 5)
    .attr("y1", 55)
    .attr("x2", 30)
    .attr("y2", 55)
    .attr("class", "whisker-line");

legend.contents.whiskers.contents.title
    .attr("x", 35)
    .attr("y", 55)
    .attr("dy", "0.3em");

legend.contents.outliers.contents.indicator_circle
    .attr("cx", 17)
    .attr("cy", 75)
    .style("fill", "rgb(255, 255, 255)")
    .attr("class", "outlier-circle");

legend.contents.outliers.contents.title
    .attr("x", 35)
    .attr("y", 75)
    .attr("dy", "0.3em");

var chart = {canvas: svg.append("g"), contents: {}};

// Build Chart Axis.
chart.contents.x_label = chart.canvas.append("text");
chart.contents.y_label = chart.canvas.append("text");

chart.canvas.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

chart.contents.x_label
    .attr("x", width)
    .attr("y", height - 6)
    .attr("class", "x-label")
    .text(chart_properties.axis_labels.x);

chart.contents.y_label
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", ".85em")
    .attr("transform", "rotate(-90)")
    .attr("class", "y-label")
    .text(chart_properties.axis_labels.y);

chart.contents.x_axis = chart.canvas.append("g")
    .attr("transform", "translate(0, " + height + ")")
    .call(d3.axisBottom(x));

chart.contents.y_axis = chart.canvas.append("g")
    .call(d3.axisLeft(y).ticks(10));

// Build Boxplots
chart.contents.boxplots = [];
for(var i = 0; i < data.length; i++) {
    var canvas = chart.canvas;
    var boxplot_elements = {};
    var d = data[i];

    boxplot_elements.whisker_upper = canvas.append("line");
    boxplot_elements.whisker_lower = canvas.append("line");
    boxplot_elements.whisker_line = canvas.append("line");
    boxplot_elements.inner_quartile_range = canvas.append("rect");
    boxplot_elements.median_line = canvas.append("line");
    boxplot_elements.median_circle = canvas.append("circle");

    boxplot_elements.whisker_upper
        .attr("class", "whisker-end")
        .attr("x1", x(d.label) + ~~(0.25 * x.bandwidth()))
        .attr("y1", y(d.whiskers[1]))
        .attr("x2", x(d.label) + ~~(0.75 * x.bandwidth()))
        .attr("y2", y(d.whiskers[1]));

    boxplot_elements.whisker_lower
        .attr("class", "whisker-end")
        .attr("x1", x(d.label) + ~~(0.25 * x.bandwidth()))
        .attr("y1", y(d.whiskers[0]))
        .attr("x2", x(d.label) + ~~(0.75 * x.bandwidth()))
        .attr("y2", y(d.whiskers[0]));

    boxplot_elements.whisker_line
        .attr("class", "whisker-line")
        .attr("x1", x(d.label) + ~~(0.5 * x.bandwidth()))
        .attr("y1", y(d.whiskers[0]))
        .attr("x2", x(d.label) + ~~(0.5 * x.bandwidth()))
        .attr("y2", y(d.whiskers[1]));

    boxplot_elements.inner_quartile_range
        .attr("class", "inner-quartile-range")
        .attr("x", x(d.label))
        .attr("y", y(d.quartiles[1]))
        .attr("width", x.bandwidth())
        .attr("height", y(d.quartiles[0]) - y(d.quartiles[1]))
        .attr("fill", boxplot_color(d.label))
        .on("mouseover", function(d) {
            tooltip_boxplot.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip_boxplot.html("Max: " + d.max + "<br />Upper Limit: " + d.whiskers[1] + "<br />75% Quartile: " + d.quartiles[1] + "<br />Median: " + d.median + "<br />25% Quartile: " + d.quartiles[0] + "<br />Lower Limit: " + d.whiskers[0] + "<br />Min: " + d.min + "<br />Std. Deviation: " + d.std_deviation + "<br />Mean: " + d.mean)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        }.bind(null, d))
        .on("mouseout", function(d) {
            tooltip_boxplot.transition()
                .duration(500)
                .style("opacity", 0);
        });

    boxplot_elements.median_line
        .attr("class", "median-line")
        .attr("x1", x(d.label) + 1)
        .attr("y1", y(d.median))
        .attr("x2", x(d.label) + x.bandwidth() - 1)
        .attr("y2", y(d.median));

    boxplot_elements.median_circle
        .attr("class", "median-circle")
        .attr("cx", x(d.label) + ~~(0.5 * x.bandwidth()))
        .attr("cy", y(d.median));

    boxplot_elements.outliers = []
    for(var j = 0; j < d.outliers.length; j++) {
        var outlier = canvas.append("circle")
            .attr("class", "outlier-circle")
            .attr("cx", x(d.label) + ~~(0.5 * x.bandwidth()))
            .attr("cy", y(d.outliers[j]))
            .style("fill", boxplot_color(d.label))
            .on("mouseover", function(d) {
                tooltip_outlier.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip_outlier.html(d)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
            }.bind(null, d.outliers[j]))
            .on("mouseout", function(d) {
                tooltip_outlier.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        boxplot_elements.outliers.push(outlier);
    }

    chart.contents.boxplots.push(boxplot_elements);
}

// Build Trendlines.
chart.contents.trendlines = []
for(var i = 1; i < data.length; i++) {
    var trendline = chart.canvas.append("line")
        .attr("class", "trendlines")
        .attr("x1", x(data[i-1].label) + ~~(0.5 * x.bandwidth()))
        .attr("y1", y(data[i-1].median))
        .attr("x2", x(data[i].label) + ~~(0.5 * x.bandwidth()))
        .attr("y2", y(data[i].median));

    chart.contents.trendlines.push(trendline);
}

d3.select('#exportpng').on('click', function() {
    svgString2Image(getSVGString(svg.node()), 2*width, 2*height, "png", function(dataBlob, filesize) {
        saveAs(dataBlob, "visualization_svg.png");
    });
});