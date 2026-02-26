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

const preview = document.getElementById('preview');

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

function updateAscii() {
    if (canvas.width === 0) return;
    const ascii = imageToAscii(canvas, parseInt(resolutionInput.value), parseInt(brightnessInput.value), parseInt(contrastInput.value));
    asciiOutput.textContent = ascii;
}


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
