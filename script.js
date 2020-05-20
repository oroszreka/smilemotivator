const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models'),
  faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

var expressions = [];
var state = null;

const happySong = document.getElementById("happy");
const sadSong = document.getElementById("upset");

function playAudio() {
  happySong.play();
}

function pauseAudio() {
  sadSong.pause();
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)

    var minVal = 0;
    var expression = null;
    for (var variable in resizedDetections[0].expressions) {
      if (resizedDetections[0].expressions.hasOwnProperty(variable)) {
        if (resizedDetections[0].expressions[variable] > minVal) {
          expression = variable;
          minVal = resizedDetections[0].expressions[variable];
        }
      }
    }

    if (expressions.length === 4) expressions.shift();
    expressions.push(expression);
    console.log(happySong);

    var expressed = (expression == "happy" || expression == "sad" || expression == "angry");
    // console.log(happySong);
    if (expressed && expressions.length === 4 && (expressions[0] == expressions[1]) && (expressions[1] && expressions[2]) && (expressions[2] && expressions[3]) && expression !== state) {
      console.log("PLAY");
      state = expression;
      console.log(state);
      if (state == "happy") {
        sadSong.pause();
        happySong.play();
      } else if (state == "sad" || state == "angry") {
        happySong.pause();
        sadSong.play();
      }
    }


    // console.log(expression, minVal);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})
