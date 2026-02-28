const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'web-dist');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const files = ['index.html', 'style.css', 'converter.js', 'renderer.js'];

for (const file of files) {
    fs.copyFileSync(path.join(__dirname, file), path.join(outDir, file));
}

console.log('Web build complete -> web-dist/');
