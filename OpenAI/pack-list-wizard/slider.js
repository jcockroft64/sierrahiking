function updateAvgOutput() {
  var avgSlider = document.getElementById("avgSlider");
  var avgOutput = document.getElementById("avgOutput");
  avgOutput.textContent = avgSlider.value;
}

function updateMaxOutput() {
  var maxSlider = document.getElementById("maxSlider");
  var maxOutput = document.getElementById("maxOutput");
  maxOutput.textContent = maxSlider.value;
}