var progress = 0;

//what list are we on?
function report(message){
    var elem = document.getElementById("myBar");
    elem.innerHTML = message; //html set by the report function
}
function increment(amount){
    var elem = document.getElementById("myBar");
    progress+=amount;
    var width = progress;
    console.log(width);
    elem.style.width = width + "%";
    //elem.innerHTML = width  + "%"; //html set by the report function
    // If progress reaches 100, hide the loader animation
    if (progress >= 100) {
        document.querySelector('.loader').style.display = 'none';
    }
}

function setProgressTo100(){
  var elem = document.getElementById("myBar");
  progress=100;
  var width = progress;
  console.log(width);
  elem.style.width = width + "%";
  elem.innerHTML = "Done!";
  // If progress reaches 100, hide the loader animation
  if (progress >= 100) {
      document.querySelector('.loader').style.display = 'none';
  }
}

function reset(){
    //show animation again
    document.querySelector('.loader').style.display = '';
    progress = 0;
    var elem = document.getElementById("myBar");
    elem.style.backgroundColor = "#04AA6D";
    elem.style.width = 0 + "%";
    elem.innerHTML = "Generating...";
}

function showError(message) {
    document.querySelector('.loader').style.display = 'none'; //no more loading because error
    var elem = document.getElementById("myBar");
    elem.style.width = 100  + "%";
    elem.style.backgroundColor = "red"; // Turn the bar red
    elem.innerHTML = message;
}