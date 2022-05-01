async function formatCICO(thecico) {
  // first get set of data by years
  for (let i = 0; i < years.length; i++) {
    dataByYears = { [years[i]]: [] };
    for (let ii = 0; ii < thecico.length; ii++) {
      if (+moment(thecico[ii].in).format("YYYY") === years[i]) {
        const mnth = moment(thecico[ii].in).format("MMMM");

        switch (mnth) {
          case "January":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "February":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "March":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "April":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "May":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "June":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "July":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "August":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "September":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "October":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "November":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          case "December":
            dataByMonths[mnth].push(thecico[ii]);
            break;
          default:
            break;
        }
        dataByYears[years[i]].push(dataByMonths);
      }
    }
    i++;
  }
}

const setdata = "";
