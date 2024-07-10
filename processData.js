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

  rounds.forEach((round) => {
    const roundVotes = votes.filter((vote) => vote["Round ID"] === round.ID);

    const roundSubmissions = submissions.filter(
      (submission) => submission["Round ID"] === round.ID
    );

    roundVotes.forEach((vote) => {
      // Find the corresponding submission
      const submission = roundSubmissions.find((sub) => sub["Spotify URI"] === vote["Spotify URI"]);
      if (submission["Round ID"] === vote["Round ID"]) {
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

          //find person who voted
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
  return players;
  //end
}

async function processForCharts() {
  players = await processData();
  let playerCharts = [];
  players.forEach((player) => {
    let receivedlabels = [];
    let receiveddata = [];
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
      receivedlabels.push(vote.name);
      receiveddata.push(vote.totalVotesReceived);
    });
    player.votesGiven.forEach((vote) => {
      givenlabels.push(vote.name);
      givendata.push(vote.totalVotesGiven);
    });
    playerCharts.push({
      name: player.name,
      uriName: encodeURI(player.name),
      receivedlabels: receivedlabels,
      receiveddata: receiveddata,
      givenlabels: givenlabels,
      givendata: givendata,
      backgroundColors: backgroundColors,
    });
  });
  return playerCharts;
}

(async () => {
  players = await processData();
})();

module.exports = { processFile, processAllFiles, processData, processForCharts };
