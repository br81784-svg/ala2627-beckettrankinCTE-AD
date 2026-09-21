const teams = {
  seahawks: { name: "Seattle Seahawks", abbr: "SEA", primary: "#69be28", secondary: "#12284b", record: "12 - 5 · NFC West", roster: ["Geno Smith", "Kenneth Walker III", "DK Metcalf", "Tyler Lockett", "Jaxon Smith-Njigba", "Noah Fant", "Charles Cross", "Damien Lewis", "Jason Peters", "Boye Mafe", "Julian Love"] },
  patriots: { name: "New England Patriots", abbr: "NE", primary: "#c8102e", secondary: "#0d2b56", record: "10 - 7 · AFC East", roster: ["Drake Maye", "Rhamondre Stevenson", "Demario Douglas", "Kendrick Bourne", "Ja'Lynn Polk", "Hunter Henry", "Trent Brown", "Mike Onwenu", "David Andrews", "Matthew Judon", "Jabrill Peppers"] },
  "49ers": { name: "San Francisco 49ers", abbr: "SF", primary: "#aa0000", secondary: "#b3995d", record: "12 - 5 · NFC West", roster: ["Brock Purdy", "Christian McCaffrey", "Deebo Samuel", "Brandon Aiyuk", "Jauan Jennings", "George Kittle", "Trent Williams", "Aaron Banks", "Jake Brendel", "Nick Bosa", "Fred Warner"] },
  rams: { name: "Los Angeles Rams", abbr: "LA", primary: "#ffa300", secondary: "#003594", record: "10 - 7 · NFC West", roster: ["Matthew Stafford", "Kyren Williams", "Cooper Kupp", "Puka Nacua", "Tutu Atwell", "Tyler Higbee", "Alaric Jackson", "Steve Avila", "Kevin Dotson", "Kobie Turner", "Bobby Wagner"] }
};
const opponentOrder = ["seahawks", "patriots", "49ers", "rams"];
const offenseShape = [
  ["QB", 22, 51, "quarterback"], ["RB", 29, 57, "receiver-d"], ["WR", 37, 23, "receiver-a"],
  ["WR", 43, 75, "receiver-w"], ["TE", 57, 43, "receiver-s"], ["LT", 33, 47, "lineman"],
  ["LG", 37, 47, "lineman"], ["C", 41, 47, "lineman"], ["RG", 45, 47, "lineman"],
  ["RT", 49, 47, "lineman"], ["FB", 53, 55, "lineman"]
];
const defenseShape = [
  ["CB", 35, 18], ["S", 41, 30], ["DE", 46, 38], ["DT", 50, 44], ["NT", 54, 44],
  ["DT", 58, 44], ["DE", 62, 38], ["LB", 47, 58], ["LB", 55, 58], ["CB", 67, 72], ["S", 74, 27]
];
const $ = (id) => document.getElementById(id);
const field = $("field");
let selectedTeam = "seahawks", mode = "offense", yards = 0, plays = 0, score = 0, driveSeconds = 119, ballX = 25, ballY = 52, down = 1, distance = 10;
let opponentTeam = "patriots";
function getOpponent() {
  opponentTeam = opponentOrder.find((teamKey) => teamKey !== selectedTeam);
  return teams[opponentTeam];
}
function makeStickFigure(name, role, x, y, side, index, receiverKey) {
  const player = document.createElement("div");
  const linemanClass = ["LT", "LG", "C", "RG", "RT", "FB"].includes(role) ? " lineman-player" : "";
  player.className = `stick-player ${side}-player ${role.toLowerCase()}-player${linemanClass}`;
  player.style.left = `${x}%`; player.style.top = `${y}%`; player.dataset.name = name; player.dataset.role = role;
  if (receiverKey) player.dataset.receiver = receiverKey;
  if (role === "QB") player.id = "quarterback";
  player.innerHTML = `<span class="stick-head"></span><span class="stick-body"></span><span class="stick-arms"></span><span class="stick-legs"></span><b class="player-label">${name}<small>${role}</small></b><strong class="route-key">${receiverKey || ""}</strong>`;
  player.style.setProperty("--player-index", index);
  return player;
}
function renderPlayers() {
  const offense = $("offensePlayers"); const defense = $("defensePlayers");
  offense.replaceChildren(); defense.replaceChildren();
  const offenseTeam = teams[selectedTeam]; const defenseTeam = getOpponent();
  const receiverKeys = { 1: "D", 2: "A", 3: "W", 4: "S" };
  offenseTeam.roster.forEach((name, index) => {
    const [role, x, y] = offenseShape[index]; offense.appendChild(makeStickFigure(name, role, x, y, "offense", index, receiverKeys[index]));
  });
  defenseTeam.roster.forEach((name, index) => {
    const [role, x, y] = defenseShape[index]; defense.appendChild(makeStickFigure(name, role, x, y, "defense", index));
  });
  $("awayLabel").textContent = defenseTeam.abbr; $("opponentName").textContent = defenseTeam.name; $("possessionText").textContent = `${offenseTeam.abbr} BALL`;
}
function updateTeam() {
  const team = teams[selectedTeam];
  document.documentElement.style.setProperty("--team-primary", team.primary);
  document.documentElement.style.setProperty("--team-secondary", team.secondary);
  $("teamName").textContent = team.name; $("teamRecord").textContent = team.record; $("homeLabel").textContent = team.abbr;
  renderPlayers();
}
function updateStats() {
  $("yards").textContent = yards; $("plays").textContent = plays; $("homeScore").textContent = score;
  $("possession").textContent = `${Math.floor(driveSeconds / 60)}:${String(driveSeconds % 60).padStart(2, "0")}`;
  const suffix = down === 1 ? "st" : down === 2 ? "nd" : down === 3 ? "rd" : "th";
  $("downDistance").innerHTML = `${down}${suffix} &amp; ${distance}`; $("playText").textContent = `${down === 1 ? "1ST" : down === 2 ? "2ND" : down === 3 ? "3RD" : "4TH"} & ${distance} · OWN ${25 + yards}`;
}
function toast(message) {
  const display = $("fieldToast"); display.textContent = message; display.classList.remove("show"); void display.offsetWidth; display.classList.add("show");
}
function move(dx, dy) {
  ballX = Math.max(12, Math.min(83, ballX + dx)); ballY = Math.max(11, Math.min(87, ballY + dy));
  $("quarterback").style.left = `${ballX}%`; $("quarterback").style.top = `${ballY}%`;
}
function pass(receiver) {
  if (mode === "defense") { tackle(receiver); return; }
  const outcomes = { W: [18, "COMPLETE!"], A: [11, "DOT!"], S: [7, "SHORT GAIN"], D: [4, "CHECKDOWN"] };
  const [gain, message] = outcomes[receiver]; const target = document.querySelector(`[data-receiver="${receiver}"]`); const ball = $("ball");
  plays += 1; driveSeconds = Math.max(0, driveSeconds - 9); ball.style.left = target ? getComputedStyle(target).left : "50%"; ball.style.top = target ? getComputedStyle(target).top : "50%"; ball.style.opacity = "1"; setTimeout(() => { ball.style.opacity = "0"; }, 400);
  yards += gain; distance = Math.max(1, distance - gain); score += gain >= 18 ? 7 : 0; toast(score && gain >= 18 ? "TOUCHDOWN!" : message);
  $("playStatus").textContent = `${receiver} route hit for ${gain} yards. Choose the next play.`;
  if (distance <= 1) { down = 1; distance = 10; } else { down = down === 4 ? 1 : down + 1; } updateStats();
}
function tackle(direction) { plays += 1; driveSeconds = Math.max(0, driveSeconds - 7); toast("BIG HIT!"); $("playStatus").textContent = `Tackle made with ${direction}. Offense stopped for a loss.`; updateStats(); }
function setMode(nextMode) {
  mode = nextMode; document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  $("playStatus").textContent = mode === "offense" ? "Choose a receiver with W, A, S, or D." : "Close the gap. Use WASD to make a tackle."; field.classList.toggle("defensive", mode === "defense");
}
function resetGame() {
  yards = 0; plays = 0; score = 0; driveSeconds = 119; down = 1; distance = 10; ballX = 25; ballY = 52; $("quarterback").style.left = `${ballX}%`; $("quarterback").style.top = `${ballY}%`; $("playStatus").textContent = "Choose a receiver with W, A, S, or D."; setMode("offense"); updateStats(); toast("KICKOFF");
}
$("teamSelect").addEventListener("change", (event) => { selectedTeam = event.target.value; updateTeam(); resetGame(); });
document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
$("restartButton").addEventListener("click", resetGame);
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) event.preventDefault();
  if (key === "arrowup") move(0, -4); if (key === "arrowdown") move(0, 4); if (key === "arrowleft") move(-4, 0); if (key === "arrowright") move(4, 0); if (["w", "a", "s", "d"].includes(key)) pass(key.toUpperCase());
});
updateTeam(); updateStats();
