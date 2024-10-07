const video = document.getElementById("video");
const rpmDisplay = document.getElementById("rpmDisplay");
const statusDisplay = document.getElementById("status");
const startButton = document.getElementById("startButton");

let lastTime = null;
let rpm = 0;

function calculateRPM() {
  const currentTime = new Date().getTime();
  if (lastTime !== null) {
    const timeDiff = (currentTime - lastTime) / 1000; // seconds
    rpm = 60 / timeDiff;
    updateUI(rpm);
  }
  lastTime = currentTime;
}

function updateUI(rpm) {
  rpmDisplay.textContent = rpm.toFixed(2);

  const desiredRPM = 33.33; // Desired RPM for calibration
  const tolerance = 0.02; // 2% tolerance

  const lowerBound = desiredRPM * (1 - tolerance);
  const upperBound = desiredRPM * (1 + tolerance);

  if (rpm >= lowerBound && rpm <= upperBound) {
    statusDisplay.textContent = "Calibrated";
    statusDisplay.style.color = "green";
  } else {
    statusDisplay.textContent = "Not Calibrated";
    statusDisplay.style.color = "red";
  }
}

startButton.addEventListener("click", function () {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
      detectMarker(video);
    })
    .catch(function (err) {
      console.error("Error accessing the camera: ", err);
    });
});

function detectMarker(videoElement) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  setInterval(function () {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      if (red > 200 && green > 200 && blue > 200) {
        calculateRPM(); // Marker detected, calculate RPM
        break;
      }
    }
  }, 100); // Check every 100ms
}
