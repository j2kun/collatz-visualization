import * as d3 from 'd3';
import { sprintf } from 'sprintf-js';

// http://www.d3noob.org/2014/02/styles-in-d3js.html

// let num_points = 1000000;
let numPoints = 5000;

let width = 1200;
let height = 1000;
let svg = d3.select("#content").append("svg")
                           .attr('id', 'rendered_svg')
                           .attr("width", width)
                           .attr("height", height);

let parameters = {
  numDisplay: 100,
  evenAngle: 10,  // angle adjustment, even goes right, odd goes left, in degrees
  oddAngle: 20,
  startingPoint: [width / 2, height - 100],
  segmentLength: 7,
  startingAngle: 150,
}

let state = {
  polylines: null,
  graph: null,
}


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
    let angleRadians = Math.PI * angle / 180;
    let newX = currentPoint[0] + Math.round(segmentLength * Math.cos(angleRadians));
    let newY = currentPoint[1] - Math.round(segmentLength * Math.sin(angleRadians));
    currentPoint = [newX, newY];
    polylinePoints.push(currentPoint.join(','));
  }

  return polylinePoints.join(', ');
}


function createPolylines(graph, parameters) {
  return graph.map(function(n) {
    return generatePolyline(graph, n, parameters);
  });
}


function render(polylinePoints, parameters) {
  let polylines = svg.selectAll("polyline").data(polylinePoints);
  polylines.exit().remove();
  polylines.enter().append('polyline');
  // style
  polylines.style("stroke", "black")
           .style("fill", "none")
           .style("stroke-width", 2)
           .style("stroke-linecap", "round")
           .style("stroke-linejoin", "round");
  // data
  polylines.attr("points", function(d) { return d; });
}


function setupSliders() {
  d3.select("#evenAngle").attr('value', '100');
  d3.select("#oddAngle").attr('value', '200');
  d3.select("#evenAngle");
  d3.select("#evenAngle").on("input", function() {
    parameters.evenAngle = this.value / 10;
    update();
  });
  d3.select("#oddAngle").on("input", function() {
    parameters.oddAngle = this.value / 10;
    update();
  });
  parameters.evenAngle = 10;
  parameters.oddAngle = 20;
}


function update() {
  setLabels(parameters.evenAngle, parameters.oddAngle);
  state.polylines = createPolylines(state.graph, parameters);
  render(state.polylines, parameters);
}


function setLabels(evenAngle, oddAngle) {
  d3.select('#evenAngleDegreesLabel').text(sprintf("%2.1f", evenAngle));
  d3.select('#oddAngleDegreesLabel').text(sprintf("%2.1f", oddAngle));
}


d3.select('#hide_while_loading').style('display', 'none');
d3.select('#loading').style('display', 'block');

state.graph = generateCollatz(numPoints);
setupSliders(10, 20);
update();

d3.select('#loading').style('display', 'none');
d3.select('#hide_while_loading').style('display', 'flex');
