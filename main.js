
const API_KEY = "bc1b64fd59ee4cf28648a25dd6abdd49";
const API_URL = "https://api.sportsdata.io/v3/nfl/stats/json/PlayerSeasonStats/2023REG";
const INITIAL_SUPPLY = 1000;

let players = [];
let portfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");

function savePortfolio() {
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

function renderMarket() {
  const marketDiv = document.getElementById("market");
  marketDiv.innerHTML = "<h2>🏈 Athlete Market</h2><table><thead><tr><th>Name</th><th>Team</th><th>Pos</th><th>Price</th><th>Available</th><th></th></tr></thead><tbody>";

  players.forEach(player => {
    marketDiv.innerHTML += \`<tr>
      <td>\${player.name}</td>
      <td>\${player.team}</td>
      <td>\${player.position}</td>
      <td>$\${player.price}</td>
      <td>\${player.availableShares}</td>
      <td><button onclick="buy(\${player.id})" \${player.availableShares <= 0 ? 'disabled' : ''}>Buy</button></td>
    </tr>\`;
  });

  marketDiv.innerHTML += "</tbody></table>";
}

function renderPortfolio() {
  const portDiv = document.getElementById("portfolio");
  if (!portfolio.length) {
    portDiv.innerHTML = "<h2>📦 Portfolio</h2><p>You don't own any shares yet.</p>";
    return;
  }

  portDiv.innerHTML = "<h2>📦 Portfolio</h2><table><thead><tr><th>Name</th><th>Team</th><th>Qty</th><th>Price</th><th>Total</th><th></th></tr></thead><tbody>";
  let total = 0;

  portfolio.forEach(entry => {
    const value = entry.price * entry.quantity;
    total += value;
    portDiv.innerHTML += \`<tr>
      <td>\${entry.name}</td>
      <td>\${entry.team}</td>
      <td>\${entry.quantity}</td>
      <td>$\${entry.price.toFixed(2)}</td>
      <td>$\${value.toFixed(2)}</td>
      <td><button onclick="sell(\${entry.id})">Sell</button></td>
    </tr>\`;
  });

  portDiv.innerHTML += \`</tbody></table><p><strong>Total Portfolio Value: $ \${total.toFixed(2)}</strong></p>\`;
}

function buy(id) {
  const player = players.find(p => p.id === id);
  const owned = portfolio.find(p => p.id === id);

  if (player.availableShares <= 0) return;

  player.availableShares -= 1;

  if (owned) {
    owned.quantity += 1;
  } else {
    portfolio.push({ ...player, quantity: 1 });
  }

  savePortfolio();
  renderMarket();
  renderPortfolio();
}

function sell(id) {
  const owned = portfolio.find(p => p.id === id);
  const player = players.find(p => p.id === id);
  if (!owned || !player) return;

  owned.quantity -= 1;
  player.availableShares += 1;

  if (owned.quantity <= 0) {
    portfolio = portfolio.filter(p => p.id !== id);
  }

  savePortfolio();
  renderMarket();
  renderPortfolio();
}

function resetPortfolio() {
  if (confirm("Are you sure you want to reset your portfolio?")) {
    portfolio = [];
    players.forEach(p => p.availableShares = INITIAL_SUPPLY);
    savePortfolio();
    renderMarket();
    renderPortfolio();
  }
}

function useFallbackPlayers() {
  players = [
    { id: 1, name: "Fallback Mahomes", team: "KC", position: "QB", price: 45.5, availableShares: INITIAL_SUPPLY },
    { id: 2, name: "Fallback Allen", team: "BUF", position: "QB", price: 39.2, availableShares: INITIAL_SUPPLY },
    { id: 3, name: "Fallback Hurts", team: "PHI", position: "QB", price: 41.7, availableShares: INITIAL_SUPPLY }
  ];
  renderMarket();
  renderPortfolio();
}

async function loadPlayers() {
  try {
    const res = await fetch(API_URL, {
      headers: { "Ocp-Apim-Subscription-Key": API_KEY }
    });
    if (!res.ok) throw new Error("API returned status " + res.status);
    const data = await res.json();

    players = data
      .filter(p => p.Name && p.FantasyPoints)
      .slice(0, 20)
      .map(p => ({
        id: p.PlayerID,
        name: p.Name,
        team: p.Team,
        position: p.Position,
        price: parseFloat((p.FantasyPoints / 2).toFixed(2)),
        availableShares: INITIAL_SUPPLY
      }));

    renderMarket();
    renderPortfolio();
  } catch (err) {
    console.error("Failed to load live player data:", err);
    document.getElementById("market").innerHTML = "<p style='color:red;'>⚠️ Live data failed to load. Showing fallback players.</p>";
    useFallbackPlayers();
  }
}

loadPlayers();
