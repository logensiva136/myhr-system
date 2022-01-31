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
