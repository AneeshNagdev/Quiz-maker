const fs = require('fs');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function processAndShuffleQuizData(data) {
    const shuffledData = JSON.parse(JSON.stringify(data));
    shuffleArray(shuffledData);
    
    shuffledData.forEach((q, qIndex) => {
        let items = q.options.map(opt => {
            // Debug missing data:
            if (!q.answer) throw new Error("Missing answer at Q " + qIndex);
            if (!q.explanations || !q.explanations[opt[0]]) {
                throw new Error("Missing explanation for option " + opt[0] + " at Q " + qIndex);
            }
            return {
                oldId: opt[0],
                text: opt[1],
                isAnswer: opt[0] === q.answer,
                explanation: q.explanations[opt[0]]
            };
        });
        
        shuffleArray(items);
        
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
        q.options = [];
        q.explanations = {};
        
        items.forEach((item, index) => {
            const newLetter = letters[index];
            q.options.push([newLetter, item.text]);
            q.explanations[newLetter] = item.explanation;
            if (item.isAnswer) {
                q.answer = newLetter;
            }
        });
    });
    
    return shuffledData;
}

try {
    const raw = fs.readFileSync('RBC_40_Clinical_MCQs.json', 'utf8');
    const data = JSON.parse(raw);
    console.log("Length:", data.length);
    const out = processAndShuffleQuizData(data);
    console.log("Success! Rendered Q1:", out[0].question);
} catch (e) {
    console.error("ERROR:", e.message);
}
