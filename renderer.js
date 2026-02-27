const { imageToAscii } = require('./converter');
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');

const asciiOutput = document.getElementById('asciiOutput');

const ctx = canvas.getContext('2d');

const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const brightnessVal = document.getElementById('brightnessVal');
const contrastVal = document.getElementById('contrastVal');

const resolutionInput = document.getElementById('resolution');
const resolutionVal = document.getElementById('resolutionVal');

const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');

const preview = document.getElementById('preview');

const charRamp = document.getElementById('charRamp');
const resetRamp = document.getElementById('resetRamp');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            preview.src = event.target.result;
            console.log(`Image loaded: ${img.width}`);

            updateAscii();
        };
    };

    reader.readAsDataURL(file);
});

let asciiLines = [];
let undoStack = [];
let redoStack = [];
let selecting = false;
let selStart = null;
let selEnd = null;
let charWidth = 0;
let lineHeight = 0;

const selectionOverlay = document.createElement('div');
selectionOverlay.id = 'selectionOverlay';
asciiOutput.parentElement.style.position = 'relative';
asciiOutput.parentElement.appendChild(selectionOverlay);

function measureCharSize() {
    const style = getComputedStyle(asciiOutput);
    const span = document.createElement('span');
    span.style.font = style.font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.textContent = 'M';
    document.body.appendChild(span);
    charWidth = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
}

function updateAscii() {
    if (canvas.width === 0) return;
    const ascii = imageToAscii(canvas, parseInt(resolutionInput.value), parseInt(brightnessInput.value), parseInt(contrastInput.value), charRamp.value);
    asciiLines = ascii.split('\n');
    selStart = null;
    selEnd = null;
    asciiOutput.textContent = asciiLines.join('\n');
    updateOverlay();
    measureCharSize();
}

function getCharPosition(e) {
    const rect = asciiOutput.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / charWidth);
    const row = Math.floor((e.clientY - rect.top + asciiOutput.scrollTop) / lineHeight);
    return { row, col };
}

function updateOverlay() {
    if (!selStart || !selEnd) {
        selectionOverlay.style.display = 'none';
        return;
    }

    const minRow = Math.min(selStart.row, selEnd.row);
    const maxRow = Math.max(selStart.row, selEnd.row);
    const minCol = Math.min(selStart.col, selEnd.col);
    const maxCol = Math.max(selStart.col, selEnd.col);

    const rect = asciiOutput.getBoundingClientRect();
    const parentRect = asciiOutput.parentElement.getBoundingClientRect();

    selectionOverlay.style.display = 'block';
    selectionOverlay.style.left = (rect.left - parentRect.left + minCol * charWidth) + 'px';
    selectionOverlay.style.top = (rect.top - parentRect.top + minRow * lineHeight - asciiOutput.scrollTop) + 'px';
    selectionOverlay.style.width = ((maxCol - minCol + 1) * charWidth) + 'px';
    selectionOverlay.style.height = ((maxRow - minRow + 1) * lineHeight) + 'px';
}

asciiOutput.addEventListener('mousedown', (e) => {
    if (charWidth === 0) measureCharSize();
    const pos = getCharPosition(e);
    if (!pos) return;
    selecting = true;
    selStart = pos;
    selEnd = pos;
    updateOverlay();
});

asciiOutput.addEventListener('mousemove', (e) => {
    if (!selecting) return;
    selEnd = getCharPosition(e);
    updateOverlay();
});

asciiOutput.addEventListener('mouseup', () => {
    selecting = false;
});

document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selStart && selEnd) {
        undoStack.push(asciiLines.slice());
        redoStack = [];

        const minRow = Math.min(selStart.row, selEnd.row);
        const maxRow = Math.max(selStart.row, selEnd.row);
        const minCol = Math.min(selStart.col, selEnd.col);
        const maxCol = Math.max(selStart.col, selEnd.col);

        for (let row = minRow; row <= maxRow; row++) {
            if (row < asciiLines.length) {
                const line = asciiLines[row];
                const before = line.substring(0, minCol);
                const after = line.substring(maxCol + 1);
                const spaces = ' '.repeat(maxCol - minCol + 1);
                asciiLines[row] = before + spaces + after;
            }
        }

        selStart = null;
        selEnd = null;
        asciiOutput.textContent = asciiLines.join('\n');
        updateOverlay();
    }

    if (e.key === 'z' && e.ctrlKey && undoStack.length > 0) {
        redoStack.push(asciiLines.slice());
        asciiLines = undoStack.pop();
        selStart = null;
        selEnd = null;
        asciiOutput.textContent = asciiLines.join('\n');
        updateOverlay();
    }

    if (e.key === 'y' && e.ctrlKey && redoStack.length > 0) {
        undoStack.push(asciiLines.slice());
        asciiLines = redoStack.pop();
        selStart = null;
        selEnd = null;
        asciiOutput.textContent = asciiLines.join('\n');
        updateOverlay();
    }
});

brightnessInput.addEventListener('input', () => {
    brightnessVal.textContent = brightnessInput.value;
    updateAscii();
});

contrastInput.addEventListener('input', () => {
    contrastVal.textContent = contrastInput.value;
    updateAscii();
});

resolutionInput.addEventListener('input', () => {
    resolutionVal.textContent = resolutionInput.value;
    updateAscii();
});

copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(asciiOutput.textContent).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });
});

saveBtn.addEventListener('click', () => {
    const blob = new Blob([asciiOutput.textContent], { type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
})

charRamp.addEventListener('input', () => {
    updateAscii();
})

resetRamp.addEventListener('click', () => {
    charRamp.value = '@%#*+=. ';
    updateAscii();
})