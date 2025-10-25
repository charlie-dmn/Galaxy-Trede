const cryptoList = document.getElementById("crypto-list");
const stockList = document.getElementById("stock-list");

// Load Crypto Data (CoinGecko REST API)
async function loadCrypto() {
  const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,dogecoin,solana,cardano");
  const data = await res.json();
  cryptoList.innerHTML = data.map(coin => `
    <li>
      <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
      <span>$${coin.current_price.toLocaleString()}</span>
    </li>
  `).join('');
}
loadCrypto();
setInterval(loadCrypto, 15000); // update every 15s

// Load Stock Data (Finnhub WebSocket API)
const socket = new WebSocket("wss://ws.finnhub.io?token=d3uhfb1r01qil4aq3r50d3uhfb1r01qil4aq3r5g");

// Subscribe to stock tickers
const stockSymbols = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN"];
socket.addEventListener('open', () => {
  stockSymbols.forEach(symbol => {
    socket.send(JSON.stringify({ type: 'subscribe', symbol }));
  });
});

const stockPrices = {};

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.data) {
    data.data.forEach(item => {
      stockPrices[item.s] = item.p;
    });
    renderStocks();
  }
});

function renderStocks() {
  stockList.innerHTML = Object.entries(stockPrices).map(([symbol, price]) => `
    <li>
      <span>${symbol}</span>
      <span>$${price.toFixed(2)}</span>
    </li>
  `).join('');
}
