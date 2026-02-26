const ASCII_CHARS = '@%#*+=-:. ';

function imageToAscii(canvas, blockSize = 8, brightness = 0, contrast = 0) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0,0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let asciiArt = '';

    for (let y = 0; y < canvas.height; y += blockSize) {
        for (let x = 0; x < canvas.width; x += blockSize / 2) {
            let totalBrightness = 0;
            let count = 0;

            for (let dy = 0; dy < blockSize && y + dy < canvas.height; dy++) {
                for (let dx = 0; dx < blockSize && x + dx < canvas.width; dx++) {
                    const pixelIndex = ((y+dy) * canvas.width + (x+dx)) *4;
                    const r = pixels[pixelIndex];
                    const g = pixels[pixelIndex +1];
                    const b = pixels[pixelIndex +2];
                    const rawBrightness = (r + g + b) / 3;
                    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    let adjusted = contrastFactor * (rawBrightness - 128) + 128;
                    adjusted += brightness;
                    adjusted = Math.max(0, Math.min(255, adjusted));
                    totalBrightness += adjusted;
                    count++;
                }
            }
            const avgBrightness = totalBrightness / count;
            const charIndex = Math.floor((avgBrightness / 255) * (ASCII_CHARS.length - 1));
            asciiArt += ASCII_CHARS[charIndex];
            }
            asciiArt += '\n';
        }
        return asciiArt;
    }

module.exports = { imageToAscii };
