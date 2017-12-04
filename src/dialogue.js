function dialogue(d) {
    d = parseInt(d) || 0;
    switch(d) {
        case 0:
            $('#dialogue-imm').classList.add('hidden');
            $('#pnl-immorals').classList.add('hidden');
            $('#dialogue-turnoff').classList.add('hidden');
            $('#dialogue-shortcut').classList.add('hidden');
            $('#dialogue-woah').classList.add('hidden');
            $('#pnl-woah').classList.add('hidden');
            $('#dialogue-tldr').classList.add('hidden');
            $('#dialogue-yikes').classList.add('hidden');
            $('#dialogue-twitter').classList.add('hidden');
            break;
        case 1:
            m.setThrottle(0.75);
            localStorage.setItem('throttle', 0.75);
            $('#pnl-dialogue').classList.add('hidden');
            break;
        case 2:
            m.setThrottle(0.50);
            localStorage.setItem('throttle', 0.50);
            $('#pnl-dialogue').classList.add('hidden');
            break;
        case 3:
            m.setThrottle(0.10);
            localStorage.setItem('throttle', 0.10);
            $('#pnl-dialogue').classList.add('hidden');
            break;
        case 4:
            setTimeout(() => $('#dialogue-imm').classList.remove('hidden'), 200);
            setTimeout(() => $('#pnl-immorals').classList.remove('hidden'), 900);
            break;
        case 5:
            setTimeout(() => $('#dialogue-turnoff').classList.remove('hidden'), 200);
            setTimeout(() => $('#dialogue-twitter').classList.remove('hidden'), 900);
            $('#dialogue-turnoff').classList.add('hidden');
            $('#dialogue-shortcut').classList.add('hidden');
            $('#dialogue-woah').classList.add('hidden');
            $('#pnl-woah').classList.add('hidden');
            $('#dialogue-tldr').classList.add('hidden');
            $('#dialogue-yikes').classList.add('hidden');
            break;
        case 6:
            setTimeout(() => $('#dialogue-shortcut').classList.remove('hidden'), 200);
            setTimeout(() => $('#dialogue-twitter').classList.remove('hidden'), 900);
            $('#dialogue-turnoff').classList.add('hidden');
            $('#dialogue-woah').classList.add('hidden');
            $('#pnl-woah').classList.add('hidden');
            $('#dialogue-tldr').classList.add('hidden');
            $('#dialogue-yikes').classList.add('hidden');
            break;
        case 7:
            setTimeout(() => $('#dialogue-woah').classList.remove('hidden'), 200);
            setTimeout(() => $('#pnl-woah').classList.remove('hidden'), 900);
            $('#dialogue-turnoff').classList.add('hidden');
            $('#dialogue-shortcut').classList.add('hidden');
            $('#dialogue-tldr').classList.add('hidden');
            $('#dialogue-yikes').classList.add('hidden');
            $('#dialogue-twitter').classList.add('hidden');
            break;
        case 8:
            setTimeout(() => $('#dialogue-yikes').classList.remove('hidden'), 200);
            setTimeout(() => $('#dialogue-twitter').classList.remove('hidden'), 900);
            $('#dialogue-turnoff').classList.add('hidden');
            $('#dialogue-shortcut').classList.add('hidden');
            $('#dialogue-woah').classList.add('hidden');
            $('#pnl-woah').classList.add('hidden');
            $('#dialogue-tldr').classList.add('hidden');
            break;
        case 9:
            setTimeout(() => $('#dialogue-tldr').classList.remove('hidden'), 400);
            setTimeout(() => $('#dialogue-twitter').classList.remove('hidden'), 2000);
            break;
    }
}

const lblChars = $('#dialogue-chars');
const lblDetails = $('#dialogue-details');
const btnSubmit = $('#dialogue-submit');
function carefullyReadImportantOpinion(textarea) {
    const len = textarea.value.length;
    lblChars.textContent = 5000 - len;
    lblDetails.classList.toggle('hidden', len >= 5000);
    btnSubmit.classList.toggle('disabled', len < 5000);
}


dialogue(0);
$('#pnl-dialogue').classList.toggle('hidden', localStorage.getItem('throttle'));