const fs = require('fs');

function generateDiacritics(start, end, exceptions = new Set()) {
    const diacritics = [];
    for (let i = start; i <= end; i++) {
        if (!exceptions.has(i)) {
            diacritics.push(String.fromCharCode(i));
        }
    }
    return diacritics;
}

function zalgo(text, maxFileSize, options = { top: true, middle: true, bottom: true }) {
    const diacriticsTop = generateDiacritics(768, 789).concat(
        generateDiacritics(794, 795),
        generateDiacritics(820, 836),
        generateDiacritics(848, 850)
    );

    const diacriticsMiddle = generateDiacritics(820, 824);

    const diacriticsBottom = generateDiacritics(790, 819, new Set([794, 795])).concat(
        generateDiacritics(825, 828),
        generateDiacritics(837, 841),
        generateDiacritics(845, 846),
        generateDiacritics(851, 854),
        generateDiacritics(857, 858),
        generateDiacritics(860, 860)
    );

    const diacriticsPerChar = options.top + options.middle + options.bottom;
    const approxHeight = Math.floor(maxFileSize / (text.length * diacriticsPerChar));

    let newText = '';
    let progress = 0; 

    for (let i = 0; i < text.length; i++) {
        let newChar = text[i];
        let diacriticIndex = 0;

        let newTextSize = Buffer.byteLength(newText, 'utf8');

        // Middle
        if (options.middle && newTextSize < maxFileSize) {
            newChar += diacriticsMiddle[diacriticIndex % diacriticsMiddle.length];
            newTextSize = Buffer.byteLength(newText, 'utf8');
        }
        
        // Top
        if (options.top && newTextSize < maxFileSize) {
            for (let count = 0; count < approxHeight && newTextSize < maxFileSize; count++) {
                newChar += diacriticsTop[diacriticIndex % diacriticsTop.length];
                newTextSize = Buffer.byteLength(newChar, 'utf8');
                diacriticIndex++;
            }
        }
        
        // Bottom
        if (options.bottom && newTextSize < maxFileSize) {
            for (let count = 0; count < approxHeight && newTextSize < maxFileSize; count++) {
                newChar += diacriticsBottom[diacriticIndex % diacriticsBottom.length];
                newTextSize = Buffer.byteLength(newChar, 'utf8');
                diacriticIndex++;
            }
        }

        newText += newChar;

        progress = Math.floor((i / text.length) * 100);
        process.stdout.clearLine(); 
        process.stdout.cursorTo(0); 
        process.stdout.write(`Progress: ${progress}%`);
    }

    process.stdout.write('\n'); 
    return newText;
}


const options = {
    top: true,
    middle: true,
    bottom: true,
    randomization: 100,
};

var text = "HAHAHAHAHAHAHAHHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHA";
const filesize = 1048576 * 2.5;

console.log("Starting zalgo generation process; this may take a while depending on the size.")
const generated = zalgo(text, filesize, options);
console.log("Generated zalgo string of length", generated.length)

//This creates a file containing zalgo text of a certain size
fs.writeFileSync('README.md', generated);