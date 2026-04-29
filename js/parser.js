// Parser and Data Processing logic
function parseRawTextToJSON(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    const data = [];
    let currentBlock = null;

    // Improved Regexes
    const questionHeaderRegex = /^(?:Question|Q|Ques)?\s*\d+[\.\:\-\)]?\s*/i;
    const optionRegex = /^(?:\()?([a-h1-8])[\.\)](?:\s+|$)/i;
    const answerRegex = /^(?:Correct\s+)?(?:Answer|Ans|Option|Correct)[\:\-]?\s*(?:\()?([a-h1-8])(?:\))?/i;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let isNewQuestion = false;

        if (questionHeaderRegex.test(line)) {
            if (!currentBlock || currentBlock.options.length >= 2) {
                isNewQuestion = true;
            }
        } else if (currentBlock && currentBlock.options.length >= 2) {
            if (!optionRegex.test(line) && !answerRegex.test(line) && line.endsWith('?')) {
                isNewQuestion = true;
            }
        } else if (!currentBlock) {
            isNewQuestion = true;
        }

        if (isNewQuestion) {
            if (currentBlock && currentBlock.question.length > 0 && currentBlock.options.length > 0) {
                finalizeBlock(currentBlock);
                data.push(currentBlock);
            }
            let qText = line.replace(questionHeaderRegex, '').trim();
            currentBlock = {
                question: qText ? [qText] : [],
                options: [],
                answer: null,
                explanations: {},
                unassignedLines: [],
                parsingMode: "question"
            };
            continue;
        }

        if (answerRegex.test(line) && currentBlock.options.length > 0) {
            const match = line.match(answerRegex);
            if (match && match[1]) {
                currentBlock.answer = normalizeLetter(match[1]);
            }
            currentBlock.parsingMode = "answer";
        } else if (optionRegex.test(line)) {
            currentBlock.parsingMode = "options";
            const match = line.match(optionRegex);
            const rawId = match[1];
            const letter = normalizeLetter(rawId);
            
            let text = line.replace(optionRegex, '').trim();
            let explanation = "";

            const reasonMatch = text.match(/(.*?)(?:\s*[-–—]\s*)?(?:Reason|Explanation)\s*:?\s*(.*)/i);
            
            if (reasonMatch) {
                text = reasonMatch[1].trim();
                text = text.replace(/\s*[-–—]\s*$/, '').trim();
                explanation = reasonMatch[2].trim();
            } else if (/\s+[-–—]\s+/.test(text)) {
                let parts = text.split(/\s+[-–—]\s+/);
                let potentialExplanation = parts.pop().trim();
                let isExplanation = /\b(correct|incorrect|wrong|right|because|is the)\b/i.test(potentialExplanation) || potentialExplanation.length > 20;
                
                if (isExplanation) {
                    explanation = potentialExplanation;
                    text = parts.join(' - ').trim();
                } else {
                    text = parts.join(' - ') + ' - ' + potentialExplanation;
                }
            }
            
            currentBlock.options.push([letter, text]);
            if (explanation) {
                currentBlock.explanations[letter] = explanation;
            }
        } else {
            if (currentBlock.parsingMode === "question") {
                currentBlock.question.push(line);
            } else if (currentBlock.parsingMode === "options" || currentBlock.parsingMode === "answer" || currentBlock.parsingMode === "explanations") {
                const explPrefixRegex = /^(?:Explanation|Reason)?\s*(?:\()?([a-h1-8])[\.\)]?\s*[:\-]?\s*(.*)/i;
                const match = line.match(explPrefixRegex);
                
                if (match && match[1] && currentBlock.options.some(o => o[0] === normalizeLetter(match[1]))) {
                    const letter = normalizeLetter(match[1]);
                    const content = match[2] ? match[2].trim() : "";
                    if (!currentBlock.explanations[letter]) currentBlock.explanations[letter] = "";
                    currentBlock.explanations[letter] += (currentBlock.explanations[letter] ? " " : "") + content;
                    currentBlock.parsingMode = "explanations";
                    currentBlock.lastExplLetter = letter;
                } else if (currentBlock.parsingMode === "explanations" && currentBlock.lastExplLetter) {
                    currentBlock.explanations[currentBlock.lastExplLetter] += " " + line;
                } else {
                    currentBlock.unassignedLines.push(line);
                }
            }
        }
    }
    
    if (currentBlock && currentBlock.question.length > 0 && currentBlock.options.length > 0) {
        finalizeBlock(currentBlock);
        data.push(currentBlock);
    }

    function finalizeBlock(block) {
        if (block.unassignedLines && block.unassignedLines.length > 0) {
            const optsWithoutExpl = block.options.filter(opt => !block.explanations[opt[0]]);
            
            if (block.unassignedLines.length === optsWithoutExpl.length && optsWithoutExpl.length > 0) {
                optsWithoutExpl.forEach((opt, idx) => {
                    block.explanations[opt[0]] = block.unassignedLines[idx];
                });
            } else if (block.unassignedLines.length === block.options.length) {
                block.options.forEach((opt, idx) => {
                    block.explanations[opt[0]] = block.unassignedLines[idx];
                });
            } else if (block.options.length > 0) {
                block.options[block.options.length - 1][1] += " " + block.unassignedLines.join(" ");
            }
        }
    }
    
    function normalizeLetter(id) {
        id = id.toUpperCase();
        const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F', '7': 'G', '8': 'H' };
        return map[id] || id;
    }

    const finalData = data.map((block, index) => {
        const qTexts = block.question.join(' ');
        
        if (!block.answer) {
            for (let i = 0; i < block.options.length; i++) {
                let letter = block.options[i][0];
                let expl = block.explanations[letter] || "";
                if (expl && /\b(?:is correct|correct answer|is the correct|correct)\b/i.test(expl) && !/\b(?:incorrect|wrong)\b/i.test(expl)) {
                    block.answer = letter;
                    break;
                }
            }
            if (!block.answer && block.options.length > 0) {
                block.answer = block.options[0][0]; // fallback
            }
        }
        
        const finalExplanations = {};
        block.options.forEach(opt => {
            if (block.explanations[opt[0]]) {
                finalExplanations[opt[0]] = block.explanations[opt[0]];
            } else {
                finalExplanations[opt[0]] = opt[0] === block.answer ? "Correct answer." : "Incorrect.";
            }
        });
        
        return {
            question: qTexts || "Question " + (index + 1),
            options: block.options,
            answer: block.answer,
            explanations: finalExplanations
        };
    });

    if (finalData.length === 0) {
        throw new Error("Could not parse. Please ensure inputs contain clear Questions, Options (A), B), etc).");
    }
    
    return finalData;
}

function validateQuizData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const item = data[0];
    return item.question && item.options && item.answer && item.explanations;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function processAndShuffleQuizData(data) {
    const shuffledData = JSON.parse(JSON.stringify(data));
    
    // Shuffle overall questions
    shuffleArray(shuffledData);
    
    // Shuffle options and re-map letters
    shuffledData.forEach(q => {
        let items = q.options.map(opt => ({
            oldId: opt[0],
            text: opt[1],
            isAnswer: opt[0] === q.answer,
            explanation: q.explanations[opt[0]]
        }));
        
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
