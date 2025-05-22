
const players = [
  { id: 1, name: "Patrick Mahomes", price: 45.5 },
  { id: 2, name: "Josh Allen", price: 39.2 },
  { id: 3, name: "Jalen Hurts", price: 41.7 }
];

let portfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");

function savePortfolio() {
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
}

function renderMarket() {
  const marketDiv = document.getElementById("market");
  marketDiv.innerHTML = "<h2>🏈 Athlete Market</h2>";
  players.forEach(p => {
    const btn = `<button onclick='buy(${p.id})'>Buy $${p.price}</button>`;
    marketDiv.innerHTML += `<p>${p.name} - $${p.price} ${btn}</p>`;
  });
}

function renderPortfolio() {
  const portDiv = document.getElementById("portfolio");
  if (!portfolio.length) {
    portDiv.innerHTML = "<h2>📦 Portfolio</h2><p>You don't own any shares yet.</p>";
    return;
  }
  portDiv.innerHTML = "<h2>📦 Portfolio</h2>";
  portfolio.forEach(p => {
    portDiv.innerHTML += `<p>${p.name} - ${p.quantity} shares @ $${p.price} 
      <button onclick='sell(${p.id})'>Sell</button></p>`;
  });
  const total = portfolio.reduce((sum, p) => sum + p.price * p.quantity, 0);
  portDiv.innerHTML += `<p><strong>Total Value: $${total.toFixed(2)}</strong></p>`;
}

function buy(id) {
  const player = players.find(p => p.id === id);
  const owned = portfolio.find(p => p.id === id);
  if (owned) {
    owned.quantity += 1;
  } else {
    portfolio.push({ ...player, quantity: 1 });
  }
  savePortfolio();
  renderPortfolio();
}

function sell(id) {
  const owned = portfolio.find(p => p.id === id);
  if (!owned) return;
  owned.quantity -= 1;
  if (owned.quantity <= 0) {
    portfolio = portfolio.filter(p => p.id !== id);
  }
  savePortfolio();
  renderPortfolio();
}

function resetPortfolio() {
  if (confirm("Reset your portfolio?")) {
    portfolio = [];
    savePortfolio();
    renderPortfolio();
  }
}

renderMarket();
renderPortfolio();
