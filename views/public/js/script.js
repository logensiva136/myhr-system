
//clock//
function getTime() {
  const newTime = new Date();
  // alert(newTime.toLocaleTimeString())
  let hrs = newTime.getHours("hh");
  hrs = ("0" + hrs).slice(-2);
  let mins = newTime.getMinutes("mm");
  mins = ("0" + mins).slice(-2);
  let secs = newTime.getSeconds("ss");
  secs = ("0" + secs).slice(-2);
  $("#realTimeClock").text(hrs + ":" + mins + ":" + secs);
  // $("#realTimeClock").text(moment().format('LTS'));
  $('#theTime').val(newTime.toISOString());
}
setInterval(getTime, 900);

//styling
let pushWidth = document.getElementById("sidebar").offsetWidth;
let pushHeight = document.getElementById("homeico").offsetHeight;

pushWidth = pushWidth + "px";

pushHeight = pushHeight + 10;
pushHeight = pushHeight + "px";

document.getElementById("body").style.marginLeft = pushWidth;
document.getElementById("topPusher").style.marginTop = pushHeight;
document.getElementById("topPusher").style.marginBottom = "1.5rem";

$('#reason').click(function () {
  if ($("#reason").val() === "out") {
    alert("logen")
  }
})