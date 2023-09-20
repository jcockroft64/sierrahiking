function updateAvgOutput() {
  var avgSlider = document.getElementById("avgSlider");
  var avgOutput = document.getElementById("avgOutput");
  avgOutput.textContent = (avgSlider.value / 1000).toFixed(1); // ToFixed(1) for one decimal place
}

function updateMaxOutput() {
  var maxSlider = document.getElementById("maxSlider");
  var maxOutput = document.getElementById("maxOutput");
  maxOutput.textContent = (maxSlider.value / 1000).toFixed(1); // ToFixed(1) for one decimal place
}