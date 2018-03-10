
//canvas defaults
var canvasWidth = 800;
var canvasHeight = 600;
var ZERO = 0;

//Entity Defaults

var matureAge= 12;
var timeTillDeathFromIllness = 180;
var reproductionWaitTime = 180;//3 seconds

//Entity Behavior
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

function calculateMidY(y1,y2) {
    return Math.abs((y2+y1)/2);
}
function calculateMidX(x1,x2) {
    return Math.abs((x2+x1)/2);
}

