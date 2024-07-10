var fs = require("node:fs");
var { parse } = require("csv-parse");
const express = require("express");
const app = express();
const port = 3000;
const { processForCharts } = require("./processData");
app.set("view engine", "ejs");
/*example of processed csv objects
votes = [{
    'Spotify URI': 'spotify:track:3QSjVPObHxuAJc3E5nrjRn',
    'Voter ID': '72633bdfdd634d77bb3cafcd68adc205',
    Created: '2023-11-08T18:42:52Z',
    'Points Assigned': '2',
    Comment: '',
    'Round ID': '4a5de4e05cfd4edea98f4d9ca5ee3d2b'
  },...]
submissions = [
  {
    'Spotify URI': 'spotify:track:0Kt9sF46S7DFKrQOsXqidV',
    Title: 'Blood - End Credits',
    Album: 'The Black Parade Is Dead!',
    'Artist(s)': 'My Chemical Romance',
    'Submitter ID': '8534b56c8c17416399e40867a55ee238',
    Created: '2023-10-31T19:31:56Z',
    Comment: '',
    'Round ID': '306618975cb445678415b3e4ccc0f8a2',
    'Visible To Voters': 'No'
  },...]
  competitors = [
  { ID: '34b25d7e77ca4a9094f5be4824179bc8', Name: 'willstett' },
  { ID: '37ac29814b45431e8a7f8c5933f70f4c', Name: 'John Endres' },
  { ID: '72633bdfdd634d77bb3cafcd68adc205', Name: 'Aya Endres' },
  { ID: '7d5ffc2a42d74f9db5fb492234eb38df', Name: 'vari-lite' },
  { ID: '8534b56c8c17416399e40867a55ee238', Name: 'Cole' },
  { ID: '8af08f436eb44be5b2774ae28cad9d62', Name: 'Twyla' },
  { ID: '9a95f4b3c9ff4cfa974ff7eba1160f04', Name: '124270909' },
  { ID: 'c03ea0ff06414a3db15c674e53c0dd67', Name: 'Dustin Brashear' },
  { ID: 'c6d1fb774afd43f8884c346433c7bce7', Name: 'Chris' },
  { ID: 'cb2a0e8f95124d5b85d7d00def234564', Name: 'eragon00230' },
  { ID: 'ded003ef081743dbb71c97bf27e95c56', Name: 'Emily' },
  { ID: 'f16c8cb7c892491c997f8267e6adb822', Name: 'Billy' },
  { ID: 'f97267c5ec9f4532b3558606bec4cd1a', Name: 'cassellroll21' }
]
rounds = [  {
    ID: 'ef69668bf01c4f3e91aa00daf980bb15',
    Created: '2024-05-28T15:46:29Z',
    Name: 'Did I just submit the song of the summer?',
    Description: 'Its hot out. lets get some summer jams',
    'Playlist URL': 'https://open.spotify.com/playlist/4uak85BlTE8PcB37EGZ8lb'
  }
]


*/

app.use(express.static("public"));

app.set("views", __dirname + "/views");
// app.get("/chartsjs", async (req, res) => {
//   res.sendFile(`${__dirname}/node_modules/chart.js/auto`);
// });
// app.get("/processData", async (req, res) => {
//   res.sendFile(`${__dirname}/processData.js`);
// });

app.get("/data", async (req, res) => {
  const playerCharts = await processForCharts();
  res.json(playerCharts);
});

app.get("/", async (req, res) => {
  const playerCharts = await processForCharts();
  res.render("home", {
    data: playerCharts,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
