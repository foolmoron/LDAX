// elements
const inpCoinName = $('#inp-coin-name');
const lblCurrentCoin = $('#lbl-current-coin');
const lblTickers = $$('.lbl-ticker');
const lblOriginalValidation = $('#lbl-original-validation');
const lblUnrealized = $('#lbl-unrealized');
const lblCurrentBoth = $('#lbl-current-both');
const lblBestRealized = $('#lbl-best-realized');
const lblBestBoth = $('#lbl-best-both');
const lblCurrentPrice = $('#lbl-current-price');
const lblMarketCap = $('#lbl-market-cap');
const lblCoin = $('#lbl-coin');
const lblCash = $('#lbl-cash');
const btnCreateCoin = $('#btn-create-coin');
const pnlCreate = $('#pnl-create');
const pnlWorth = $('#pnl-worth');
const pnlCandlestick = $('#pnl-candlestick');
const pnlAssets = $('#pnl-assets');
const pnlDialogue = $('#pnl-dialogue');
const chrWorth = $('#chr-worth');
const gRealized = $('#g-realized');
const gUnrealized = $('#g-unrealized');
const gBoth = $('#g-both');
const chrMarket = $('#chr-market');
const gMarket = $('#g-market');

// data
let data = {};
let dataExtra = {
    bestRealized: 0,
    bestBoth: 0,
    worstBoth: Infinity,
};
function load() {
    try { data = JSON.parse(localStorage.getItem('data1')); } catch(e) { }
    data = Object.assign({
        name: '',
        ticker: '',
        started: false,
        tick: 0,
        coins: [1],
        cashs: [10],
        prices: [1],
        actions: [],
        priceVelocity: 0,
    }, data);
}
function save() {
    localStorage.setItem('data1', JSON.stringify(data));
    load();
}

function getDifficulty() {
    return Math.max(0, Math.floor(Math.log10(data.prices[data.prices.length - 1])));
}

// misc
const TICK_WIDTH = 10;
const CANDLESTICK_GAP = 0.25;
const vowels = ['A','E','I','O','U'];

function tickerSymbolFromCoinName(coinName) {
    const nameClean = (coinName || '').toUpperCase().replace(/[^\w\s]/gi, '');
    const nameNoSpaces = nameClean.replace(' ', '');
    if (nameNoSpaces.replace(' ', '').length == 0) {
        return '';
    } else if (nameNoSpaces.replace(' ', '').length <= 3) {
        return nameNoSpaces + 'CN'.substr(nameNoSpaces.length - 1);
    } else {
        const words = nameClean.split(' ').filter(w => w.length > 0);
        const letters = [null, null, null];
        if (words.length >= 3) {
            letters[0] = words[0][0];
            letters[1] = words[1][0];
            letters[2] = words[2][0];
        } else if (words.length == 2) {
            letters[0] = words[0][0];
            letters[2] = words[1][0];
        } else {
            letters[0] = words[0][0];
        }

        // any null letters mean there's 2 words of 2 letters each, or 1 word of 4+ letters
        const coinCashHack = (words[1] == 'CASH' || words[1] == 'COIN') && (nameNoSpaces.match(/C/g) || []).length > 1;
        for (let l = 0; l < letters.length; l++) {
            if (letters[l] != null) {
                continue;
            }
            const prevLetter = letters[l - 1] || '';
            const nextLetter = letters[l + 1] || '';
            letters[l] = nameNoSpaces[l];
            for (let i = nameNoSpaces.length - 1; i >= 1; i--) {
                const letter = nameNoSpaces[i];
                if (letter == prevLetter && letters[l] != prevLetter) {
                    continue;
                }
                if (letter != nextLetter && letters[l] == nextLetter && coinCashHack) {
                    continue;
                }
                if (vowels.indexOf(letter) >= 0 && vowels.indexOf(letters[l]) < 0) {
                    continue;
                }
                letters[l] = letter;
            }
        }

        return letters.join('');
    }
}

const existingCoinNames = ['','bit','ethereum','bitcash','bcash','ripple','dash','lite','bitgold','iota','cardano','monero','ethereumclassic','nem','neo','eos','stellarlumens','bitconnect','omisego','qtum','lisk','zcash','tether','hshare','waves','stratis','populous','ardor','nxt','ark','augur','mona','byte','bitshares','decred','vert','komodo','steem','pivx','salt','golem','sia','status','powerledger','doge','tenx','maidsafe','walton','binance','digixdao','veritaseum','minex'];
function validateCoinName() {
    const ticker = tickerSymbolFromCoinName(inpCoinName.value);
    updateTickers(ticker);
    const unoriginal = inpCoinName.value && existingCoinNames.indexOf(inpCoinName.value.toLowerCase().replace(/([^\w\s]| |coin)/gi, '')) >= 0;
    lblOriginalValidation.classList.toggle('hidden', !unoriginal);
    btnCreateCoin.classList.toggle('disabled', ticker.length == 0 || unoriginal);
}

function updateTickers(tickerText) {
    for (const ticker of lblTickers) {
        ticker.textContent = tickerText;
    }
}

function updateWorstBoth() {
    dataExtra.worstBoth = Infinity;
    for (let i = 0; i < 100 && i < data.prices.length; i++) {
        const both = data.cashs[data.cashs.length - 1] + (data.prices[data.prices.length - 1] * data.coins[data.coins.length - 1]);
        dataExtra.worstBoth = Math.min(both, dataExtra.worstBoth);
    }
}

const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
function setMoneyLabel(label, amount) {
    label.textContent =format.format(amount).substr(1);
}

function updateMoneyLabels() {
    setMoneyLabel(lblBestRealized, dataExtra.bestRealized);
    setMoneyLabel(lblBestBoth, dataExtra.bestBoth);
    setMoneyLabel(lblUnrealized, data.prices[data.prices.length - 1] * data.coins[data.coins.length - 1]);
    setMoneyLabel(lblCurrentBoth, data.cashs[data.cashs.length - 1] + data.prices[data.prices.length - 1] * data.coins[data.coins.length - 1]);
    setMoneyLabel(lblCurrentPrice, data.prices[data.prices.length - 1]);
    setMoneyLabel(lblMarketCap, data.prices[data.prices.length - 1] * 21000);
    setMoneyLabel(lblCoin, data.coins[data.coins.length - 1]);
    setMoneyLabel(lblCash, data.cashs[data.cashs.length - 1]);
}

// charts
function getMax(points) {
    let max = 0;
    for (const point of points) {
        max = Math.max(max, point);
    }
    return {x: points.length * TICK_WIDTH, y: Math.max(0, Math.log10(max) || 0)};
}
function updateChartSize(group, max) {
    var chart = group.parentElement;
    var newMaxX = Math.max(max.x, chart.dataset.maxX || 0);
    var newMaxY = Math.max(max.y, chart.dataset.maxY || 0);
    chart.dataset.maxX = newMaxX;
    chart.dataset.maxY = newMaxY;
    chart.setAttribute('viewBox', `0 0 ${newMaxX} ${newMaxY*1.1}`);
    chart.style.width = newMaxX;
}
function scrollToRightNextFrame(group, force) {
    var chart = group.parentElement;
    var container = chart.parentElement;
    var isAtRight = container.scrollLeft == container.scrollWidth - container.clientWidth;
    if (isAtRight || force) {
        setTimeout(() => container.scrollLeft = container.scrollWidth, 0);
    }
}

function renderLineChart(group, points) {
    scrollToRightNextFrame(group);
    while (group.children.length) {
        group.removeChild(group.children[0]);
    }
    let prevPoint = 0;
    for (let p = 0; p < points.length; p++) {
        const point = points[p];
        const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', (p - 1) * TICK_WIDTH);
        line.setAttribute('y1', Math.max(0, Math.log10(prevPoint) || 0));
        line.setAttribute('x2', p * TICK_WIDTH);
        line.setAttribute('y2', Math.max(0, Math.log10(point) || 0));
        group.appendChild(line);
        prevPoint = point;
    }
    updateChartSize(group, getMax(points));
}
function addPointToLineChart(group, points, point) {
    scrollToRightNextFrame(group);
    const prevPoint = points[points.length - 1] || 0;
    points.push(point);
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    line.setAttribute('x1', (points.length - 2) * TICK_WIDTH);
    line.setAttribute('y1', Math.max(0, Math.log10(prevPoint) || 0));
    line.setAttribute('x2', (points.length - 1) * TICK_WIDTH);
    line.setAttribute('y2', Math.max(0, Math.log10(point) || 0));
    group.appendChild(line);
    updateChartSize(group, getMax(points));
}

function renderCandlestick(group, points) {
    scrollToRightNextFrame(group);
    while (group.children.length) {
        group.removeChild(group.children[0]);
    }
    let prevPoint = 0;
    let x = 0;
    for (const point of points) {
        const bottom = Math.max(0, Math.log10(Math.min(prevPoint, point)) || 0);
        const height = Math.max(0.01, Math.abs(Math.max(0, Math.log10(point) || 0) - Math.max(0, Math.log10(prevPoint) || 0)));
        const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect.setAttribute('x', x + TICK_WIDTH * (CANDLESTICK_GAP / 2));
        rect.setAttribute('y', bottom);
        rect.setAttribute('width', TICK_WIDTH * (1 - CANDLESTICK_GAP));
        rect.setAttribute('height', height);
        rect.classList.add(point >= prevPoint ? 'up' : 'down');
        group.appendChild(rect);
        const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', x + TICK_WIDTH/2);
        line.setAttribute('y1', bottom - ((Math.min(height, 20) + Math.random() * 1.5) * Math.random() * Math.random() * 0.7));
        line.setAttribute('x2', x + TICK_WIDTH/2);
        line.setAttribute('y2', bottom + height + ((Math.min(height, 20) + Math.random() * 1.5) * Math.random() * Math.random() * 0.7));
        line.classList.add(point >= prevPoint ? 'up' : 'down');
        group.appendChild(line);
        x += TICK_WIDTH;
        prevPoint = point;
    }
    updateChartSize(group, getMax(points));
}
function addPointToCandlestick(group, points, point) {
    scrollToRightNextFrame(group);
    const prevPoint = points[points.length - 1] || 0;
    points.push(point);
    const bottom = Math.max(0, Math.log10(Math.min(prevPoint, point)) || 0);
    const height = Math.max(0.01, Math.abs(Math.max(0, Math.log10(point) || 0) - Math.max(0, Math.log10(prevPoint) || 0)));
    const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttribute('x', (points.length - 1) * TICK_WIDTH + TICK_WIDTH * (CANDLESTICK_GAP / 2));
    rect.setAttribute('y', bottom);
    rect.setAttribute('width', TICK_WIDTH * (1 - CANDLESTICK_GAP));
    rect.setAttribute('height', height);
    rect.classList.add(point >= prevPoint ? 'up' : 'down');
    group.appendChild(rect);
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    line.setAttribute('x1', (points.length - 0.5) * TICK_WIDTH);
    line.setAttribute('y1', bottom - ((Math.min(height, 20) + Math.random() * 1.5) * Math.random() * Math.random() * 0.7));
    line.setAttribute('x2', (points.length - 0.5) * TICK_WIDTH);
    line.setAttribute('y2', bottom + height + ((Math.min(height, 20) + Math.random() * 1.5) * Math.random() * Math.random() * 0.7));
    line.classList.add(point >= prevPoint ? 'up' : 'down');
    group.appendChild(line);
    updateChartSize(group, getMax(points));
}

// main
function createCoin(coinName) {
    pnlCreate.classList.add('hidden');
    // reset data
    data = null;
    save();
    // start new game
    data.name = inpCoinName.value;
    data.ticker = tickerSymbolFromCoinName(inpCoinName.value);
    data.started = true;
    save();
    Array.from($$('svg')).forEach(chart => chart.dataset.maxX = chart.dataset.maxY = 0);
    dataExtra = {
        bestRealized: 0,
        bestBoth: 0,
        worstBoth: Infinity,
    };
    startGame();
}

function startGame() {
    updateTickers(data.ticker);
    lblCurrentCoin.textContent = `(${data.name})`;
    pnlWorth.classList.remove('hidden');
    pnlCandlestick.classList.remove('hidden');
    pnlAssets.classList.remove('hidden');

    // calc worths
    dataExtra.realized = new Array(data.prices.length);
    dataExtra.unrealized = new Array(data.prices.length);
    dataExtra.both = new Array(data.prices.length);
    for (let i = 0; i < data.prices.length; i++) {
        dataExtra.realized[i] = data.cashs[i];
        dataExtra.unrealized[i] = data.prices[i] * data.coins[i];
        dataExtra.both[i] = dataExtra.realized[i] + dataExtra.unrealized[i];

        dataExtra.bestRealized = Math.max(dataExtra.realized[i], dataExtra.bestRealized);
        dataExtra.bestBoth = Math.max(dataExtra.realized[i] + dataExtra.unrealized[i], dataExtra.bestBoth);
    }
    updateWorstBoth();
    // render worths
    renderLineChart(gRealized, dataExtra.realized);
    renderLineChart(gUnrealized, dataExtra.unrealized);
    renderLineChart(gBoth, dataExtra.both);
    // render prices
    renderCandlestick(gMarket, data.prices);
    // labels
    updateMoneyLabels();

    // tick
    tick();
}

let tickTimeout = 0;
function tick(coinChange) {
    const price = data.prices[data.prices.length - 1];
    const coin = data.coins[data.coins.length - 1];
    const cash = data.cashs[data.cashs.length - 1];
    
    // coins
    if (coinChange != null) {
        if (coinChange > 0) {
            const coinToBuy = Math.min(cash/price, coinChange);
            if (coinToBuy == 0) {
                return;
            }
            data.priceVelocity += Math.pow(coinToBuy, 1.8);
            data.coins.push(coin + coinToBuy);
            data.cashs.push(cash - coinToBuy*price);
        } else {
            const coinToSell = Math.min(coin, -coinChange);
            if (coinToSell == 0) {
                return;
            }
            data.priceVelocity -= Math.pow(coinToSell, 2.7);
            data.coins.push(coin - coinToSell);
            data.cashs.push(cash + coinToSell*price);
        }
    } else {
        data.coins.push(coin);
        data.cashs.push(cash);
    }

    const newCoin = data.coins[data.coins.length - 1];
    const newCash = data.cashs[data.cashs.length - 1]

    // add to price based on velocity with random shift
    const difficulty = getDifficulty();
    const coinValue = coin * price;
    const coinPerc = coinValue / Math.max(0.00001, coinValue + cash);
    const priceDelta = (data.priceVelocity * lerp(0.25, 2.5, Math.random() * Math.random())) * (Math.random() < (0.15*difficulty) ? -1 : 1);
    const priceDelta2 = Math.sign(data.priceVelocity) * (coinPerc - 0.5) * (price / (difficulty + 1)) * (lerp(0.1, 1, Math.random() * Math.random()) / (difficulty + 1));
    const newPrice = Math.max(0.001, price + priceDelta + priceDelta2);

    // decay and flip
    data.priceVelocity = data.priceVelocity * 0.7;
    if ((data.priceVelocity > 0 && Math.random() < (coinPerc + 0.1)) || (data.priceVelocity < 0 && Math.random() > (coinPerc - 0.1))) {
        data.priceVelocity = -1 * Math.sign(data.priceVelocity) * lerp(0.05, 0.2, Math.random()) * price;
    }

    // data/charts
    addPointToCandlestick(gMarket, data.prices, newPrice);
    const realized = newCash;
    addPointToLineChart(gRealized, dataExtra.realized, realized);
    const unrealized = newPrice * newCoin;
    addPointToLineChart(gUnrealized, dataExtra.unrealized, unrealized);
    const both = realized + unrealized;
    addPointToLineChart(gBoth, dataExtra.both, both);

    // update stats
    dataExtra.bestRealized = Math.max(realized, dataExtra.bestRealized);
    dataExtra.bestBoth = Math.max(both, dataExtra.bestBoth);
    updateWorstBoth();
    updateMoneyLabels();

    // next tick
    const nextTickTime = 1000 * Math.sqrt(difficulty + 1);
    clearTimeout(tickTimeout);
    tickTimeout = setTimeout(tick, nextTickTime);

    // save each tick
    save();
}

// start
load();
if (data.started) {
    startGame();
} else {
    pnlCreate.classList.remove('hidden');
}