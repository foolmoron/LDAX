// elements
const inpCoinName = $('#inp-coin-name');
const lblCurrentTicker = $('#lbl-current-ticker');
const lblCurrentCoin = $('#lbl-current-coin');
const lblTicker = $('#lbl-ticker');
const lblOriginalValidation = $('#lbl-original-validation');
const btnCreateCoin = $('#btn-create-coin');
const pnlCreate = $('#pnl-create');
const pnlWorth = $('#pnl-worth');
const pnlCandlestick = $('#pnl-candlestick');
const pnlAssets = $('#pnl-assets');
const pnlActions = $('#pnl-actions');
const chrWorth = $('#chr-worth');
const gRealized = $('#g-realized');
const gUnrealized = $('#g-unrealized');
const gBoth = $('#g-both');
const chrMarket = $('#chr-market');
const gMarket = $('#g-market');

// data
let data = {};
function load() {
    try { data = JSON.parse(localStorage.getItem('data1')); } catch(e) { }
    data = Object.assign({
        name: '',
        ticker: '',
        started: false,
        cash: 1000,
        coin: 100,
        tick: 0,

    }, data);
}
function save() {
    localStorage.setItem('data1', JSON.stringify(data));
    load();
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
            let bestLetter = nameNoSpaces[l];
            for (let i = nameNoSpaces.length - 1; i >= 1; i--) {
                const letter = nameNoSpaces[i];
                if (letter == prevLetter && bestLetter != prevLetter) {
                    continue;
                }
                if (letter != nextLetter && bestLetter == nextLetter && coinCashHack) {
                    continue;
                }
                if (vowels.indexOf(letter) >= 0 && vowels.indexOf(bestLetter) < 0) {
                    continue;
                }
                bestLetter = letter;
            }
            letters[l] = bestLetter;
        }

        return letters.join('');
    }
}

const existingCoinNames = ['','bit','ethereum','bitcash','bcash','ripple','dash','lite','bitgold','iota','cardano','monero','ethereumclassic','nem','neo','eos','stellarlumens','bitconnect','omisego','qtum','lisk','zcash','tether','hshare','waves','stratis','populous','ardor','nxt','ark','augur','mona','byte','bitshares','decred','vert','komodo','steem','pivx','salt','golem','sia','status','powerledger','doge','tenx','maidsafe','walton','binance','digixdao','veritaseum','minex'];
function validateCoinName() {
    const ticker = tickerSymbolFromCoinName(inpCoinName.value);
    lblTicker.textContent = ticker;
    const unoriginal = inpCoinName.value && existingCoinNames.indexOf(inpCoinName.value.toLowerCase().replace(/([^\w\s]| |coin)/gi, '')) >= 0;
    lblOriginalValidation.classList.toggle('hidden', !unoriginal);
    btnCreateCoin.classList.toggle('disabled', ticker.length == 0 || unoriginal);
}

// charts
function getMax(points) {
    let max = 0;
    for (point of points) {
        max = Math.max(max, point);
    }
    return {x: points.length * TICK_WIDTH, y: max};
}
function updateChartSize(group, max) {
    var chart = group.parentElement;
    var newMaxX = Math.max(max.x, chart.dataset.maxX || 0);
    var newMaxY = Math.max(max.y, chart.dataset.maxY || 0);
    chart.dataset.maxX = newMaxX;
    chart.dataset.maxY = newMaxY;
    chart.setAttribute('viewBox', `0 0 ${newMaxX} ${newMaxY}`);
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
        line.setAttribute('y1', prevPoint);
        line.setAttribute('x2', p * TICK_WIDTH);
        line.setAttribute('y2', point);
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
    line.setAttribute('x1', (points.length - 1) * TICK_WIDTH);
    line.setAttribute('y1', prevPoint.y);
    line.setAttribute('x2', (points.length - 1) * TICK_WIDTH);
    line.setAttribute('y2', point.y);
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
    for (point of points) {
        const bottom = Math.min(prevPoint, point);
        const height = Math.abs(point - prevPoint);
        const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        rect.setAttribute('x', x + TICK_WIDTH * (CANDLESTICK_GAP / 2));
        rect.setAttribute('y', bottom);
        rect.setAttribute('width', TICK_WIDTH * (1 - CANDLESTICK_GAP));
        rect.setAttribute('height', height);
        rect.classList.add(point >= prevPoint ? 'up' : 'down');
        group.appendChild(rect);
        const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', x + TICK_WIDTH/2);
        line.setAttribute('y1', bottom - (Math.max(height, 20) * Math.random() * Math.random() * 0.7));
        line.setAttribute('x2', x + TICK_WIDTH/2);
        line.setAttribute('y2', bottom + height + (Math.max(height, 20) * Math.random() * Math.random() * 0.7));
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
    const bottom = Math.min(prevPoint, point);
    const height = Math.abs(point - prevPoint);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    rect.setAttribute('x', (points.length - 1) * TICK_WIDTH + TICK_WIDTH * (CANDLESTICK_GAP / 2));
    rect.setAttribute('y', bottom);
    rect.setAttribute('width', TICK_WIDTH * (1 - CANDLESTICK_GAP));
    rect.setAttribute('height', height);
    rect.classList.add(point >= prevPoint ? 'up' : 'down');
    group.appendChild(rect);
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    line.setAttribute('x1', (points.length - 0.5) * TICK_WIDTH);
    line.setAttribute('y1', bottom - (Math.max(height, 20) * Math.random() * Math.random() * 0.7));
    line.setAttribute('x2', (points.length - 0.5) * TICK_WIDTH);
    line.setAttribute('y2', bottom + height + (Math.max(height, 20) * Math.random() * Math.random() * 0.7));
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
    startGame();
}

function startGame() {
    lblCurrentTicker.textContent = data.ticker;
    lblCurrentCoin.textContent = `(${data.name})`;
    pnlWorth.classList.remove('hidden');
    pnlCandlestick.classList.remove('hidden');
    pnlAssets.classList.remove('hidden');
    pnlActions.classList.remove('hidden');
}

// start
load();
if (data.started) {
    startGame();
} else {
    // TODO: tutorial?? something
}

renderLineChart(gRealized, Array.from(Array(1000), (d, i) => Math.sqrt(i*100)*Math.random() * 1000));
renderLineChart(gUnrealized, Array.from(Array(1000), (d, i) => Math.sqrt(i*100)*Math.random() * 1000));
renderLineChart(gBoth, Array.from(Array(1000), (d, i) => Math.sqrt(i*100)*Math.random() * 1000));
renderCandlestick(gMarket, Array.from(Array(1000), (d, i) => Math.sqrt(i*100)*Math.random() * 1000));