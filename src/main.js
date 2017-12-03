// elements
const inpCoinName = $('#inp-coin-name');
const lblCurrentTicker = $('#lbl-current-ticker');
const lblCurrentCoin = $('#lbl-current-coin');
const lblTicker = $('#lbl-ticker');
const lblOriginalValidation = $('#lbl-original-validation');
const btnCreateCoin = $('#btn-create-coin');
const pnlCreate = $('#pnl-create');
const pnlCandlestick = $('#pnl-candlestick');
const pnlAssets = $('#pnl-assets');
const pnlActions = $('#pnl-actions');

// data
let data = {};
function load() {
    try { data = JSON.parse(localStorage.getItem('data1')); } catch(e) { }
    data = Object.assign({
        name: '',
        ticker: '',
        started: false,
    }, data);
}
function save() {
    localStorage.setItem('data1', JSON.stringify(data));
    load();
}

// misc
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

// main
function createCoin(coinName) {
    pnlCreate.classList.add('hidden');
    // reset data
    data = {};
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