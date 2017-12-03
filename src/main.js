// elements
const inpCoinName = $('#inp-coin-name');
const lblTicker = $('#lbl-ticker');
const lblOriginalValidation = $('#lbl-original-validation');
const btnCreateCoin = $('#btn-create-coin');

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
            letters = [words[0][0], words[1][0], words[2][0]];
        } else if (words.length == 2) {
            letters[0] = words[0][0];
            letters[2] = words[1][0];
        } else {
            letters[0] = words[0][0];
        }

        // any null letters mean there's 2 words of 2 letters each, or 1 word of 4+ letters
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
                if (letter != nextLetter && bestLetter == nextLetter && nextLetter == 'C') {
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

}