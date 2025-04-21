const video = document.getElementById('video');
const emotionDisplay = document.getElementById('emotion');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch(err => console.error('Error accessing webcam:', err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const maxEmotion = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
      );
      updateMood(maxEmotion);
    }
  }, 1000);
});

function updateMood(emotion) {
  emotionDisplay.textContent = `You seem: ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;
  emotionDisplay.className = emotion;
  document.body.style.backgroundColor = getMoodColor(emotion);
}

function getMoodColor(emotion) {
  switch (emotion) {
    case 'happy': return '#ffeb3b';
    case 'sad': return '#00bcd4';
    case 'angry': return '#f44336';
    case 'surprised': return '#8e24aa';
    case 'neutral': return '#8e8e8e';
    case 'disgusted': return '#9c27b0';
    case 'fearful': return '#4caf50';
    default: return '#121212';
  }
}
