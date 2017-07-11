import * as d3 from 'd3';

// http://www.d3noob.org/2014/02/styles-in-d3js.html

// let num_points = 1000000;
let numPoints = 10000;

let width = 1000;
let height = 800;
let svg = d3.select("#content").append("svg")
                           .attr('id', 'rendered_svg')
                           .attr("width", width)
                           .attr("height", height);

let parameters = {
  numDisplay: 100,
  evenAngle: Math.PI / 20,  // angle adjustment, even goes right, odd goes left
  oddAngle: Math.PI / 15,
  startingPoint: [width / 2, height],
  segmentLength: 10,
  startingAngle: Math.PI * 0.9,
}


d3.select('#hide_while_loading').style('display', 'none');
d3.select('#loading').style('display', 'block');
let graph = generateCollatz(numPoints);
let allPolylines = graph.map(function(n) {
  return generatePolyline(graph, n, parameters);
});
window.graph = graph;
window.allPolylines = allPolylines;
console.log('Done generating data');
d3.select('#loading').style('display', 'none');
d3.select('#hide_while_loading').style('display', 'block');


function tryCreateSequence(start, max) {
  let sequence = [];
  let n = start;
  while (n != 1) {
    sequence.unshift(n);
    n = n % 2 ? 3*n + 1 : n / 2;
    if (n >= max) {
      return null;
    }
  }

  sequence.shift(1);
  return sequence;
}


function generateCollatz(n) {
  let graph = new Array(n);

  for (let i = 1; i <= n; i++) {
    let sequence = tryCreateSequence(i, n);

    if (sequence == null) {
      continue;
    }

    for (let k = 1; k < sequence.length; k++) {
      graph[sequence[k]] = sequence[k-1];
    }
  }

  return graph;
}


function generatePolyline(graph, start, parameters) {
  let {evenAngle, oddAngle, startingPoint, segmentLength, startingAngle} = parameters;
  let sequence = [start];
  let n = start;

  // generate the sequence
  let iter = 0;
  while (n && graph[n] && n != 1) {
    n = graph[n];
    sequence.unshift(n);
  }

  sequence.shift();  // skip n=1
  let polylinePoints = [startingPoint];
  let currentPoint = startingPoint;
  let angle = startingAngle;
  for (n of sequence) {
    angle += n % 2 ? oddAngle : -evenAngle;
    let newX = currentPoint[0] + Math.round(segmentLength * Math.cos(angle));
    let newY = currentPoint[1] - Math.round(segmentLength * Math.sin(angle));
    currentPoint = [newX, newY];
    polylinePoints.push(currentPoint.join(','));
  }

  return polylinePoints.join(', ');
}


function render(polylinePoints, parameters) {
  let polylines = svg.selectAll("polyline").data(polylinePoints).enter().append('polyline');
  // style
  polylines.style("stroke", "black")
           .style("fill", "none")
           .style("stroke-width", 2)
           .style("stroke-linecap", "round")
           .style("stroke-linejoin", "round");
  // data
  polylines.attr("points", function(d) { return d; });
}


render(allPolylines, parameters);
// set up visualization sliders
