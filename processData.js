var fs = require("node:fs");
var { parse } = require("csv-parse");

const processFile = async (file) => {
  const records = [];
  const parser = fs.createReadStream(file).pipe(
    parse({
      columns: true,
    })
  );
  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  return records;
};

async function processAllFiles() {
  const competitors = await processFile("competitors.csv");
  const votes = await processFile("votes.csv");
  const submissions = await processFile("submissions.csv");
  const rounds = await processFile("rounds.csv");

  return { competitors, votes, submissions, rounds };
}

async function processData() {
  const { competitors, votes, submissions, rounds } = await processAllFiles();

  //   console.log(competitors);
  //   console.log(votes);
  //   console.log(submissions);
  //   console.log(rounds);

  let players = competitors.map((competitor) => {
    return {
      id: competitor.ID,
      name: competitor.Name,
      submissions: [],
      votesGiven: [],
      votesReceived: [],
    };
  });

  const submissionsArr = submissions.map((submission) => {
    return {
      uri: submission["Spotify URI"],
      player_id: submission["Submitter ID"],
      round_id: submission["Round ID"],
    };
  });

  votes.forEach((vote) => {
    // Find the corresponding submission
    const submission = submissions.find((sub) => sub["Spotify URI"] === vote["Spotify URI"]);
    if (submission) {
      // Find the player who received the vote
      const receivingPlayer = players.find((player) => player.id === submission["Submitter ID"]);
      if (receivingPlayer) {
        // Update votesReceived for the receiving player
        let receivedEntry = receivingPlayer.votesReceived.find(
          (entry) => entry.id === vote["Voter ID"]
        );
        if (receivedEntry) {
          receivedEntry.totalVotesReceived += parseInt(vote["Points Assigned"], 10);
        } else {
          receivingPlayer.votesReceived.push({
            id: vote["Voter ID"],
            totalVotesReceived: parseInt(vote["Points Assigned"], 10),
          });
        }

        // Similarly, update votesGiven for the voter
        const votingPlayer = players.find((player) => player.id === vote["Voter ID"]);
        if (votingPlayer) {
          let givenEntry = votingPlayer.votesGiven.find(
            (entry) => entry.id === submission["Submitter ID"]
          );
          if (givenEntry) {
            givenEntry.totalVotesGiven += parseInt(vote["Points Assigned"], 10);
          } else {
            votingPlayer.votesGiven.push({
              id: submission["Submitter ID"],
              totalVotesGiven: parseInt(vote["Points Assigned"], 10),
            });
          }
        }
      }
    }
  });

  // add name field to each totalVotesReceived and totalVotesGiven
  players.forEach((player) => {
    player.votesReceived.forEach((vote) => {
      let name = competitors.find((competitor) => competitor.ID === vote.id).Name;
      vote.name = name;
    });
    player.votesGiven.forEach((vote) => {
      let name = competitors.find((competitor) => competitor.ID === vote.id).Name;
      vote.name = name;
    });
  });

  //sort votesReceived and votesGiven by totalVotesReceived and totalVotesGiven
  players.forEach((player) => {
    player.votesReceived.sort((a, b) => b.totalVotesReceived - a.totalVotesReceived);
    player.votesGiven.sort((a, b) => b.totalVotesGiven - a.totalVotesGiven);
  });

  /*   players.forEach((player) => {
    console.log(player.name);
    console.log("Votes Given: ");
    player.votesGiven.forEach((vote) => {
      console.log(vote.name + ": " + vote.totalVotesGiven);
    });
    console.log("\n");
    console.log("Votes Received: ");
    player.votesReceived.forEach((vote) => {
      console.log(vote.name + ": " + vote.totalVotesReceived);
    });
    console.log("\n");
  }); */
  return players;
  //end
}

async function processForCharts() {
  players = await processData();
  let playerCharts = [];
  players.forEach((player) => {
    let recievedlabels = [];
    let recieveddata = [];
    let givenlabels = [];
    let givendata = [];
    //13 random colors for bars
    let backgroundColors = [
      "#fd4545",
      "#f2a964",
      "#e4ff33",
      "#99ffa8",
      "#00B3E6",
      "#FFD966",
      "#FF5A5F",
      "#D8D8D8",
      "#FF7C43",
      "#A05195",
      "#665191",
      "#2f7c4c",
      "#F9C80E",
    ];
    player.votesReceived.forEach((vote) => {
      recievedlabels.push(vote.name);
      recieveddata.push(vote.totalVotesReceived);
    });
    player.votesGiven.forEach((vote) => {
      givenlabels.push(vote.name);
      givendata.push(vote.totalVotesGiven);
    });
    playerCharts.push({
      name: player.name,
      recievedlabels: recievedlabels,
      recieveddata: recieveddata,
      givenlabels: givenlabels,
      givendata: givendata,
      backgroundColors: backgroundColors,
    });
  });
  return playerCharts;
}

// (async () => {
//   playerCharts = await processForCharts();
//   console.log(playerCharts);
// })();

module.exports = { processFile, processAllFiles, processData, processForCharts };
