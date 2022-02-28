//clock
function getTime() {
  const newTime = new Date();
  let hrs = newTime.getHours("hh");
  hrs = ("0" + hrs).slice(-2);
  let mins = newTime.getMinutes("mm");
  mins = ("0" + mins).slice(-2);
  let secs = newTime.getSeconds("ss");
  secs = ("0" + secs).slice(-2);
  $("#realTimeClock").text(hrs + ":" + mins + ":" + secs);
}
setInterval(getTime, 900);

//styling
let pushWidth = document.getElementById("sidebar").offsetWidth;
let pushHeigh = document.getElementById("homeico").offsetHeight;

pushWidth = pushWidth + "px";

pushHeigh = pushHeigh + 10;
pushHeigh = pushHeigh + "px";

document.getElementById("body").style.marginLeft = pushWidth;
document.getElementById("topPusher").style.marginTop = pushHeigh;