const teams = {
  seahawks: { name: "Seattle Seahawks", abbr: "SEA", primary: "#69be28", secondary: "#12284b", record: "12 - 5 · NFC West", roster: ["Sam Darnold", "Kenneth Walker III", "Jaxon Smith-Njigba", "Cooper Kupp", "Rashid Shaheed", "AJ Barner", "Charles Cross", "Grey Zabel", "Jalen Sundell", "Leonard Williams", "Devon Witherspoon"] },
  patriots: { name: "New England Patriots", abbr: "NE", primary: "#c8102e", secondary: "#0d2b56", record: "10 - 7 · AFC East", roster: ["Drake Maye", "Rhamondre Stevenson", "Stefon Diggs", "Kayshon Boutte", "Mack Hollins", "Hunter Henry", "Will Campbell", "Mike Onwenu", "Ben Brown", "Christian Barmore", "Christian Gonzalez"] },
  "49ers": { name: "San Francisco 49ers", abbr: "SF", primary: "#aa0000", secondary: "#b3995d", record: "12 - 5 · NFC West", roster: ["Brock Purdy", "Christian McCaffrey", "Brandon Aiyuk", "Jauan Jennings", "Ricky Pearsall", "George Kittle", "Trent Williams", "Aaron Banks", "Jake Brendel", "Nick Bosa", "Fred Warner"] },
  rams: { name: "Los Angeles Rams", abbr: "LA", primary: "#ffa300", secondary: "#003594", record: "10 - 7 · NFC West", roster: ["Matthew Stafford", "Kyren Williams", "Puka Nacua", "Davante Adams", "Tutu Atwell", "Tyler Higbee", "Alaric Jackson", "Steve Avila", "Kevin Dotson", "Kobie Turner", "Byron Young"] }
};
const opponentOrder = ["seahawks", "patriots", "49ers", "rams"];
const offenseShape = [
  ["QB", 22, 51, "quarterback"], ["RB", 25, 59, "receiver-d"], ["WR", 20, 22, "receiver-a"],
  ["WR", 22, 79, "receiver-w"], ["TE", 30, 38, "receiver-s"], ["LT", 30, 39, "lineman"],
  ["LG", 30, 44, "lineman"], ["C", 30, 50, "lineman"], ["RG", 30, 56, "lineman"],
  ["RT", 30, 61, "lineman"], ["FB", 26, 51, "lineman"]
];
const defenseShape = [
  ["CB", 44, 19], ["S", 57, 25], ["DE", 41, 38], ["DT", 43, 46], ["NT", 47, 51],
  ["DT", 43, 56], ["DE", 41, 64], ["LB", 51, 40], ["LB", 53, 63], ["CB", 44, 80], ["S", 67, 28]
];
const $ = (id) => document.getElementById(id);
const field = $("field");
let selectedTeam = "seahawks", mode = "offense", yards = 0, plays = 0, score = 0, gameSeconds = 300, ballX = 22, ballY = 51, down = 1, distance = 10;
let opponentTeam = "patriots", playLive = false, openReceiver = "D", gameTimer;
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
  const openPlayer = offense.querySelector(`[data-receiver="${openReceiver}"]`);
  if (openPlayer) openPlayer.classList.add("open-receiver");
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
  $("possession").textContent = `${Math.floor(gameSeconds / 60)}:${String(gameSeconds % 60).padStart(2, "0")}`;
  const suffix = down === 1 ? "st" : down === 2 ? "nd" : down === 3 ? "rd" : "th";
  $("downDistance").innerHTML = `${down}${suffix} &amp; ${distance}`; $("playText").textContent = `${down === 1 ? "1ST" : down === 2 ? "2ND" : down === 3 ? "3RD" : "4TH"} & ${distance} · OWN ${25 + yards}`;
  $("clock").textContent = `${Math.floor(gameSeconds / 60)}:${String(gameSeconds % 60).padStart(2, "0")}`;
}
function toast(message) {
  const display = $("fieldToast"); display.textContent = message; display.classList.remove("show"); void display.offsetWidth; display.classList.add("show");
}
function move(dx, dy) {
  if (!playLive || mode !== "offense") return;
  ballX = Math.max(12, Math.min(83, ballX + dx * 2)); ballY = Math.max(11, Math.min(87, ballY + dy * 2));
  const quarterback = $("quarterback"); quarterback.style.left = `${ballX}%`; quarterback.style.top = `${ballY}%`;
  quarterback.classList.add("running");
}
function hike() {
  if (playLive || mode !== "offense") return;
  playLive = true; field.classList.add("play-live"); toast("HIKE!");
  $("playStatus").textContent = `Play live. Pass to the glowing ${openReceiver} receiver or run with the arrows.`;
  document.querySelectorAll(".defense-player").forEach((player, index) => {
    player.style.left = `${Math.min(78, parseFloat(player.style.left) + (index % 3) * 2)}%`;
    player.classList.add("rushing");
  });
  const coverage = { W: 0, A: 1, S: 2 };
  Object.entries(coverage).forEach(([receiver, defenderIndex]) => {
    const target = document.querySelector(`[data-receiver="${receiver}"]`);
    const defender = document.querySelectorAll(".defense-player")[defenderIndex];
    if (!target || !defender) return;
    target.classList.add("covered-receiver");
    defender.classList.add("coverage-player");
    defender.style.left = `${parseFloat(target.style.left) + 4}%`;
    defender.style.top = `${parseFloat(target.style.top)}%`;
  });
}
function moveToDefense(reason) {
  playLive = false; mode = "defense"; field.classList.remove("play-live"); field.classList.add("defensive");
  document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("active", button.dataset.mode === "defense"));
  $("playStatus").textContent = reason || "Turnover on downs. Stop the opponent with WASD.";
  toast("NOW DEFEND");
}
function moveToOffense() {
  playLive = false; mode = "offense"; down = 1; distance = 10; field.classList.remove("defensive", "play-live");
  document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("active", button.dataset.mode === "offense"));
  $("playStatus").textContent = "Offense back on the field. Press ↓ to hike."; updateStats();
}
function pass(receiver) {
  if (mode === "defense") { tackle(receiver); return; }
  if (!playLive) { $("playStatus").textContent = "Press ↓ to hike before choosing a pass."; return; }
  const outcomes = { W: [18, "COMPLETE!"], A: [11, "DOT!"], S: [7, "SHORT GAIN"], D: [14, "OPEN RECEIVER!" ] };
  const [gain, message] = outcomes[receiver]; const target = document.querySelector(`[data-receiver="${receiver}"]`); const ball = $("ball");
  plays += 1; gameSeconds = Math.max(0, gameSeconds - 8); ball.style.left = target ? getComputedStyle(target).left : "50%"; ball.style.top = target ? getComputedStyle(target).top : "50%"; ball.style.opacity = "1"; setTimeout(() => { ball.style.opacity = "0"; }, 400);
  playLive = false; field.classList.remove("play-live");
  if (receiver === openReceiver) { yards += gain; distance = Math.max(0, distance - gain); toast(message); } else { toast("INCOMPLETE!"); }
  if (yards >= 75) { score += 7; toast("TOUCHDOWN!"); moveToDefense("Touchdown! Now stop the opponent."); updateStats(); return; }
  if (distance <= 0) { down = 1; distance = 10; $("playStatus").textContent = "First down! Press ↓ for the next snap."; }
  else if (down === 4) { moveToDefense("Turnover on downs. Stop the opponent with WASD."); updateStats(); return; }
  else { down += 1; $("playStatus").textContent = `Play over. ${down}${down === 2 ? "nd" : down === 3 ? "rd" : "th"} down: press ↓ to hike.`; }
  updateStats();
}
function tackle(direction) {
  if (mode !== "defense") return;
  plays += 1; gameSeconds = Math.max(0, gameSeconds - 6); toast("BIG HIT!");
  $("playStatus").textContent = `Tackle made with ${direction}. You forced a stop. Press Offense to take the ball.`; updateStats();
}
function setMode(nextMode) {
  mode = nextMode; document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  playLive = false; $("playStatus").textContent = mode === "offense" ? "Press ↓ to hike, then choose a receiver." : "Close the gap. Use WASD to make a tackle."; field.classList.toggle("defensive", mode === "defense"); field.classList.remove("play-live");
}
function resetGame() {
  yards = 0; plays = 0; score = 0; gameSeconds = 300; down = 1; distance = 10; ballX = 22; ballY = 51; setMode("offense"); $("quarterback").style.left = `${ballX}%`; $("quarterback").style.top = `${ballY}%`; $("playStatus").textContent = "Press ↓ to hike, then choose a receiver."; updateStats(); toast("KICKOFF");
}
$("teamSelect").addEventListener("change", (event) => { selectedTeam = event.target.value; updateTeam(); resetGame(); });
document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
$("restartButton").addEventListener("click", resetGame);
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) event.preventDefault();
  if (key === "arrowdown") { if (mode === "offense") hike(); else move(0, 4); }
  if (key === "arrowup") move(0, -4); if (key === "arrowleft") move(-4, 0); if (key === "arrowright") move(4, 0); if (["w", "a", "s", "d"].includes(key)) pass(key.toUpperCase());
});
$("clock").textContent = "5:00";
gameTimer = setInterval(() => { if (gameSeconds > 0) { gameSeconds -= 1; updateStats(); } else { moveToDefense("Time expired. Final whistle."); } }, 1000);
updateTeam(); updateStats();
