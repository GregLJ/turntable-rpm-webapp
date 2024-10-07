const video = document.getElementById("video");
const rpmDisplay = document.getElementById("rpmDisplay");
const statusDisplay = document.getElementById("status");
const startButton = document.getElementById("startButton");

let lastDetectionTime = null;
let rpm = 0;

function calculateRPM(currentTime) {
  if (lastDetectionTime !== null) {
    const timeDiff = (currentTime - lastDetectionTime) / 1000; // seconds
    rpm = 60 / timeDiff; // Calculate RPM based on time between passes
    updateUI(rpm);
  }
  lastDetectionTime = currentTime;
}

function updateUI(rpm) {
  rpmDisplay.textContent = rpm.toFixed(2);

  const desiredRPM = 33.33; // Target RPM
  const tolerance = 0.02; // 2% tolerance range

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
    .getUserMedia({
      video: {
        facingMode: { exact: "environment" }, // Use the back camera
      },
    })
    .then(function (stream) {
      video.srcObject = stream;
      detectMarker(video); // Call the function to detect the marker
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

  const regionWidth = 100; // Width of the region of interest (matches the crosshair)
  const regionHeight = 100; // Height of the region of interest (matches the crosshair)
  const regionX = (canvas.width - regionWidth) / 2; // Center the region horizontally
  const regionY = (canvas.height - regionHeight) / 2; // Center the region vertically

  setInterval(function () {
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const frame = context.getImageData(
      regionX,
      regionY,
      regionWidth,
      regionHeight
    ); // Focus on the center region
    const data = frame.data;

    let markerDetected = false;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // Detect a bright color (assuming the marker is bright white or a distinct color)
      if (red > 200 && green > 200 && blue > 200) {
        markerDetected = true;
        break;
      }
    }

    if (markerDetected) {
      const currentTime = new Date().getTime();
      calculateRPM(currentTime); // Marker detected, calculate RPM
    }
  }, 100); // Check every 100ms
}
