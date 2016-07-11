var clm = require('clmtrackr/clmtrackr');
var pModel = require('clmtrackr/models/model_pca_20_svm.js');
var baudio = require('webaudio');
var getUserMedia = require('getusermedia');

var vid = document.getElementById('inputVideo');
var canvasInput = document.getElementById('drawCanvas');
var log = document.getElementById('log');

var cc = canvasInput.getContext('2d');

var ctracker = new clm.tracker();
ctracker.init(pModel);


var positions;
var pitch = 440;
var volume = 0.0;

var b = baudio(function (t) {
    return Math.sin(t * Math.PI * 2 * pitch) * volume;
});

b.play();


function dist(p1, p2) {
	var x = positions[p2][0] - positions[p1][0];
	var y = positions[p2][1] - positions[p1][1];
	
	return Math.sqrt(x*x + y*y);
}

function normalize(min, max, value) {
	value = value * 1 / (max - min) - min;
	return Math.min(Math.max(value, 0), 1);
}

function drawLoop() {
    requestAnimationFrame(drawLoop);
    positions = ctracker.getCurrentPosition()
    cc.clearRect(0, 0, canvasInput.width, canvasInput.height);
    ctracker.draw(canvasInput);

    var noseToLeftEye = dist(62, 27);
    var noseToRightEye = dist(62, 32);
    var noseToMouth = dist(62, 60);

    var leftBrow = (dist(27, 21) + dist(27, 20)) / 2 / noseToLeftEye;
    var rightBrow = (dist(32, 17) + dist(32, 16)) / 2 / noseToRightEye;
    var mouth = dist(60, 57) / noseToMouth;

    leftBrow = normalize(0.4, 0.7, leftBrow);
    rightBrow = normalize(0.4, 0.7, rightBrow);
    mouth = normalize(0.05, 0.6, mouth);    

    pitch = 440 + (leftBrow / 2 + rightBrow / 2) * 440;
    volume = mouth * 0.3;

    log.innerHTML = pitch + '<br>' + volume;
    //console.log(leftBrow, rightBrow, mouth);
}

getUserMedia({video: true, audio: false}, function (err, stream) {
    // if the browser doesn't support user media 
    // or the user says "no" the error gets passed 
    // as the first argument. 
    if (err) {
    	console.log('failed');
    } else {
    	vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
		vid.play();
	
		ctracker.start(vid);
		drawLoop();
    }
});
