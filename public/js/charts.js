import Chart from "/chartsjs";
import { processForCharts } from "/processData";

(async function () {
  const players = await processForCharts();

  players.forEach((player) => {
    const ctx = document.getElementById("chartReceived" + player.uriName);
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: player.receivedlabels,
        datasets: [
          {
            label: "Votes Received",
            data: player.receiveddata,
            backgroundColor: player.backgroundColors,
          },
        ],
      },
    });

    const ctx2 = document.getElementById("chartGiven" + player.uriName);
    new Chart(ctx2, {
      type: "bar",
      data: {
        labels: player.givenlabels,
        datasets: [
          {
            label: "Votes Given",
            data: player.givendata,
            backgroundColor: player.backgroundColors,
          },
        ],
      },
    });
  });
})();
