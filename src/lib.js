window.$ = (arg) => document.querySelector(arg);
window.$$ = (arg) => document.querySelectorAll(arg);
window.lerp = (a, b, t) => a*(1-t) + b*t;