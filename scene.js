var NS = 'http://www.w3.org/2000/svg';
var TAU = Math.PI * 2;
var preview = true;

function $(id) { return document.getElementById(id); }
function el(name, attrs) {
  var e = document.createElementNS(NS, name);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

function buildSpokes(id, cx, cy, r, n) {
  var g = $(id);
  for (var i = 0; i < n; i++) {
    var a = i * TAU / n;
    g.appendChild(el('line', {
      x1: cx, y1: cy,
      x2: cx + Math.cos(a) * r,
      y2: cy + Math.sin(a) * r,
      stroke: '#d8d4c7', 'stroke-width': 1.7, 'stroke-opacity': .9
    }));
  }
  g.appendChild(el('circle', { cx: cx + r * .72, cy: cy, r: 5, fill: '#e24b3f' }));
}

function buildRailing() {
  var g = $('railingPosts');
  for (var x = -700; x <= 1900; x += 220) {
    g.appendChild(el('rect', { x: x, y: 1000, width: 16, height: 190, rx: 4, fill: 'url(#rail)' }));
    g.appendChild(el('rect', { x: x - 8, y: 988, width: 32, height: 14, rx: 5, fill: '#2f2018' }));
  }
}

function buildPlanks() {
  var g = $('planks');
  for (var i = 0; i < 20; i++) {
    var y = 1080 + i * 44;
    g.appendChild(el('line', {
      x1: -700, y1: y, x2: 1900, y2: y,
      stroke: '#2a180e', 'stroke-opacity': .34, 'stroke-width': 2
    }));
  }
  for (var x = -700; x <= 1900; x += 120) {
    g.appendChild(el('line', {
      x1: x, y1: 1080, x2: x, y2: 1920,
      stroke: '#2a180e', 'stroke-opacity': .28, 'stroke-width': 2
    }));
  }
}

function findNearWing() {
  var ps = document.querySelectorAll('#pelicanAll path');
  for (var i = 0; i < ps.length; i++) {
    var d = ps[i].getAttribute('d') || '';
    if (d.indexOf('M500 902') === 0 && !ps[i].getAttribute('filter')) {
      ps[i].setAttribute('id', 'nearWing');
      return;
    }
  }
}

function ik(h, a, l1, l2, bend) {
  var dx = a.x - h.x;
  var dy = a.y - h.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  d = Math.min(d, l1 + l2 - 0.01);
  d = Math.max(d, Math.abs(l1 - l2) + 0.01);
  var base = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  var hh = Math.sqrt(Math.max(0, l1 * l1 - base * base));
  var ux = dx / d;
  var uy = dy / d;
  return {
    x: h.x + base * ux - bend * hh * uy,
    y: h.y + base * uy + bend * hh * ux
  };
}

function setLeg(pathId, outlineId, hip, knee, ankle) {
  var d = 'M ' + hip.x.toFixed(2) + ' ' + hip.y.toFixed(2) +
          ' L ' + knee.x.toFixed(2) + ' ' + knee.y.toFixed(2) +
          ' L ' + ankle.x.toFixed(2) + ' ' + ankle.y.toFixed(2);
  $(pathId).setAttribute('d', d);
  $(outlineId).setAttribute('d', d);
}

function setFoot(id, ankle) {
  $(id).setAttribute('transform', 'translate(' + ankle.x.toFixed(2) + ' ' + ankle.y.toFixed(2) + ')');
}

function draw(t) {
  var theta = TAU * (50 / 60) * t;
  var deg = theta * 180 / Math.PI;

  var hx = 2.1 * Math.sin(t * 1.7 + 0.2) + 1.0 * Math.sin(t * 3.1 + 1.1);
  var hy = 1.5 * Math.sin(t * 2.3 + 1.0) + 0.7 * Math.sin(t * 4.7);
  var hr = 0.11 * Math.sin(t * 1.1 + 0.3);
  $('camera').setAttribute('transform', 'translate(' + hx.toFixed(2) + ' ' + hy.toFixed(2) + ') rotate(' + hr.toFixed(2) + ' 540 960)');

  $('bgFar').setAttribute('transform', 'translate(' + (-t * 26).toFixed(2) + ' 0)');
  $('bgMid').setAttribute('transform', 'translate(' + (-((t * 80) % 220)).toFixed(2) + ' 0)');
  $('planks').setAttribute('transform', 'translate(' + (-((t * 190) % 120)).toFixed(2) + ' 0)');

  var wheelDeg = t * 360 * 1.55;
  $('wheelRear').setAttribute('transform', 'rotate(' + wheelDeg.toFixed(2) + ' 350 1470)');
  $('wheelFront').setAttribute('transform', 'rotate(' + wheelDeg.toFixed(2) + ' 760 1470)');
  $('crankGroup').setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' 480 1370)');
  $('chain').setAttribute('stroke-dashoffset', (-t * 260).toFixed(2));

  var crankR = 68;
  var pn = { x: 480 + Math.cos(theta) * crankR, y: 1370 + Math.sin(theta) * crankR };
  var pf = { x: 480 - Math.cos(theta) * crankR, y: 1370 - Math.sin(theta) * crankR };
  $('pedalNear').setAttribute('transform', 'translate(' + pn.x.toFixed(2) + ' ' + pn.y.toFixed(2) + ')');
  $('pedalFar').setAttribute('transform', 'translate(' + pf.x.toFixed(2) + ' ' + pf.y.toFixed(2) + ')');

  var bob = 5.2 * Math.sin(theta * 2);
  $('pelicanAll').setAttribute('transform', 'translate(0 ' + bob.toFixed(2) + ')');
  if ($('nearWing')) $('nearWing').setAttribute('transform', 'rotate(' + (-2 + 2.4 * Math.sin(theta * 2 + 0.2)).toFixed(2) + ' 500 905)');
  $('headGroup').setAttribute('transform', 'rotate(' + (1.4 * Math.sin(theta * 2 + 0.4)).toFixed(2) + ' 620 800)');
  $('shadowGroup').setAttribute('transform', 'translate(' + (2 * Math.sin(theta * 2)).toFixed(2) + ' ' + (bob * 0.22).toFixed(2) + ')');

  var hipNear = { x: 520, y: 1080 + bob * 0.55 };
  var hipFar = { x: 462, y: 1068 + bob * 0.55 };
  var ankleNear = { x: pn.x, y: pn.y - 13 };
  var ankleFar = { x: pf.x, y: pf.y - 13 };
  var kneeNear = ik(hipNear, ankleNear, 188, 188, -1);
  var kneeFar = ik(hipFar, ankleFar, 188, 188, 1);
  setLeg('legNearPath', 'legNearOutline', hipNear, kneeNear, ankleNear);
  setLeg('legFarPath', 'legFarOutline', hipFar, kneeFar, ankleFar);
  setFoot('footNear', ankleNear);
  setFoot('footFar', ankleFar);
}

findNearWing();
buildSpokes('spokesRear', 350, 1470, 136, 20);
buildSpokes('spokesFront', 760, 1470, 136, 20);
buildRailing();
buildPlanks();
draw(0);
window.renderFrame = function (t) { preview = false; draw(t); };
window.__ready = true;

function loop(now) {
  if (!preview) return;
  draw((now / 1000) % 20);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);