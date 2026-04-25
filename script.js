// DOM Elements
const views = {
    upload: document.getElementById('upload-view'),
    quiz: document.getElementById('quiz-view'),
    results: document.getElementById('results-view')
};

const elements = {
    fileInput: document.getElementById('json-upload'),
    uploadError: document.getElementById('upload-error'),
    scoreContainer: document.getElementById('score-container'),
    currentScore: document.getElementById('current-score'),
    totalQuestions: document.getElementById('total-questions'),
    qNum: document.getElementById('q-num'),
    qTotal: document.getElementById('q-total'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    explanationContainer: document.getElementById('explanation-container'),
    explanationText: document.getElementById('explanation-text'),
    explanationHeader: document.querySelector('.explanation-header'),
    cardFooter: document.getElementById('card-footer'),
    nextBtn: document.getElementById('next-btn'),
    prevBtn: document.getElementById('prev-btn'),
    questionGrid: document.getElementById('question-grid'),
    finalScoreVal: document.getElementById('final-score-val'),
    finalScoreTotal: document.getElementById('final-score-total'),
    resultsMessage: document.getElementById('results-message'),
    restartBtn: document.getElementById('restart-btn'),
    uploadAnotherBtn: document.getElementById('upload-another-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    moonIcon: document.getElementById('moon-icon'),
    sunIcon: document.getElementById('sun-icon'),
    rawTextInput: document.getElementById('raw-text-input'),
    generateTextBtn: document.getElementById('generate-text-btn')
};

// Application State
let state = {
    quizData: [],
    currentQuestionIndex: 0,
    score: 0,
    hasAnswered: false
};

// Event Listeners
elements.fileInput.addEventListener('change', handleFileUpload);
elements.generateTextBtn.addEventListener('click', handleGenerateText);
elements.nextBtn.addEventListener('click', handleNextQuestion);
elements.prevBtn.addEventListener('click', handlePrevQuestion);
elements.restartBtn.addEventListener('click', restartQuiz);
elements.uploadAnotherBtn.addEventListener('click', () => {
    switchView('upload');
    elements.fileInput.value = '';
    elements.scoreContainer.classList.add('hidden');
});
elements.themeToggle.addEventListener('click', toggleTheme);

// Functions
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        elements.moonIcon.classList.add('hidden');
        elements.sunIcon.classList.remove('hidden');
    } else {
        elements.moonIcon.classList.remove('hidden');
        elements.sunIcon.classList.add('hidden');
    }
}

function switchView(viewName) {
    Object.values(views).forEach(view => view.classList.remove('active-view'));
    views[viewName].classList.add('active-view');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (validateQuizData(data)) {
                state.originalData = data;
                initQuiz(data);
            } else {
                showError("Invalid JSON structure. Please ensure it matches the schema.");
            }
        } catch (error) {
            showError("Invalid JSON file. Please check for syntax errors.");
        }
    };
    reader.readAsText(file);
}

function handleGenerateText() {
    const rawText = elements.rawTextInput.value.trim();
    if (!rawText) {
        showError("Please paste some text first.");
        return;
    }
    
    try {
        const data = parseRawTextToJSON(rawText);
        elements.rawTextInput.value = '';
        state.originalData = data;
        initQuiz(data);
    } catch (e) {
        showError(e.message);
    }
}

function parseRawTextToJSON(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    const data = [];
    
    let currentBlock = null;
    
    // Highly versatile edge-case regex matching
    const questionHeaderRegex = /^(?:Question|Q|Ques)?\s*\d+[\.\:\-\)]?\s*/i;
    const optionRegex = /^[a-h][\.\)]\s+/i;
    const answerRegex = /^(?:Correct )?(?:Answer|Ans|Option)[\:\-]?\s*([a-h])/i;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let isNewQuestionHeader = false;
        
        if (questionHeaderRegex.test(line)) {
            if (!currentBlock || currentBlock.answer) {
                isNewQuestionHeader = true;
            }
        } else if (!currentBlock || currentBlock.answer) {
            isNewQuestionHeader = true;
        }

        if (isNewQuestionHeader) {
            if (currentBlock && currentBlock.question.length > 0 && currentBlock.options.length > 0 && currentBlock.answer) {
                data.push(currentBlock);
            }
            
            let qText = line.replace(questionHeaderRegex, '').trim();
            
            currentBlock = {
                question: qText ? [qText] : [],
                options: [],
                answer: null,
                parsingMode: "question"
            };
            continue;
        }
        
        if (answerRegex.test(line)) {
            const match = line.match(answerRegex);
            if (match && match[1]) {
                currentBlock.answer = match[1].toUpperCase();
            }
            currentBlock.parsingMode = "answer";
        } else if (optionRegex.test(line)) {
            currentBlock.parsingMode = "options";
            const letter = line.charAt(0).toUpperCase();
            // Handle variants like "A. " or "A) "
            const text = line.replace(/^[a-h][\.\)]\s*/i, '').trim();
            currentBlock.options.push([letter, text]);
        } else {
            // Continuation line
            if (currentBlock.parsingMode === "question") {
                currentBlock.question.push(line);
            } else if (currentBlock.parsingMode === "options" && currentBlock.options.length > 0) {
                currentBlock.options[currentBlock.options.length - 1][1] += " " + line;
            }
        }
    }
    
    // Flush final block
    if (currentBlock && currentBlock.question.length > 0 && currentBlock.options.length > 0 && currentBlock.answer) {
        data.push(currentBlock);
    }
    
    const finalData = data.map((block, index) => {
        const qTexts = block.question.join(' ');
        
        const explanations = {};
        block.options.forEach(opt => {
            explanations[opt[0]] = opt[0] === block.answer ? "Correct answer." : "Incorrect.";
        });
        
        return {
            question: qTexts || "Question " + (index + 1),
            options: block.options,
            answer: block.answer,
            explanations: explanations
        };
    });

    if (finalData.length === 0) {
        throw new Error("Could not parse. Please ensure inputs contain clear Questions, Options (A), B), etc), and 'Answer: X'.");
    }
    
    return finalData;
}

function validateQuizData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const item = data[0];
    return item.question && item.options && item.answer && item.explanations;
}

function showError(msg) {
    elements.uploadError.textContent = msg;
    elements.uploadError.classList.remove('hidden');
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

function initQuiz(data) {
    state.quizData = processAndShuffleQuizData(data);
    state.currentQuestionIndex = 0;
    state.score = 0;
    
    elements.questionGrid.innerHTML = '';
    state.quizData.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerHTML = `
            <span class="nav-num">${index + 1}</span>
            <span class="nav-status">--</span>
        `;
        btn.onclick = () => {
            state.currentQuestionIndex = index;
            renderQuestion();
        };
        elements.questionGrid.appendChild(btn);
    });
    
    elements.uploadError.classList.add('hidden');
    elements.totalQuestions.textContent = state.quizData.length;
    elements.qTotal.textContent = state.quizData.length;
    elements.scoreContainer.classList.remove('hidden');
    
    updateScoreDisplay();
    switchView('quiz');
    renderQuestion();
}

function renderQuestion() {
    const qData = state.quizData[state.currentQuestionIndex];
    state.hasAnswered = !!qData.userAnswer;
    
    Array.from(elements.questionGrid.children).forEach((btn, idx) => {
        btn.classList.toggle('active', idx === state.currentQuestionIndex);
        const attempted = !!state.quizData[idx].userAnswer;
        btn.classList.toggle('attempted', attempted);
        
        const statusSpan = btn.querySelector('.nav-status');
        if (attempted) {
            statusSpan.innerHTML = '&#10003;';
        } else {
            statusSpan.textContent = '--';
        }
    });

    elements.qNum.textContent = state.currentQuestionIndex + 1;
    elements.questionText.textContent = qData.question;
    
    elements.optionsContainer.innerHTML = '';

    qData.options.forEach(opt => {
        const optionId = opt[0];
        const optionText = opt[1];
        
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.id = optionId;
        
        btn.innerHTML = `
            <span class="option-letter">${optionId}</span>
            <span class="option-text">${optionText}</span>
        `;
        
        if (qData.userAnswer) {
            btn.disabled = true;
            if (optionId === qData.answer) {
                btn.classList.add('correct');
            } else if (optionId === qData.userAnswer) {
                btn.classList.add('incorrect');
            } else {
                btn.classList.add('disabled-unselected');
            }
        }
        
        btn.addEventListener('click', () => handleOptionClick(optionId, btn));
        elements.optionsContainer.appendChild(btn);
    });
    
    if (qData.userAnswer) {
        const isCorrect = qData.userAnswer === qData.answer;
        elements.explanationText.textContent = qData.explanations[qData.userAnswer];
        elements.explanationContainer.style.borderLeftColor = isCorrect ? 'var(--correct-border)' : 'var(--incorrect-border)';
        const icon = elements.explanationContainer.querySelector('.info-icon');
        icon.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
        elements.explanationHeader.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
        elements.explanationContainer.classList.remove('hidden');
    } else {
        elements.explanationContainer.classList.add('hidden');
    }

    elements.prevBtn.classList.toggle('hidden', state.currentQuestionIndex === 0);
    elements.nextBtn.classList.remove('hidden');
    
    if (state.quizData.every(q => q.userAnswer)) {
        elements.nextBtn.textContent = 'View Results';
    } else if (state.currentQuestionIndex === state.quizData.length - 1) {
        elements.nextBtn.textContent = 'Back to Start';
    } else {
        elements.nextBtn.textContent = 'Next';
    }
}

function handleOptionClick(selectedId, selectedBtn) {
    const qData = state.quizData[state.currentQuestionIndex];
    if (qData.userAnswer) return;
    
    state.hasAnswered = true;
    const isCorrect = selectedId === qData.answer;
    qData.userAnswer = selectedId;
    qData.isCorrect = isCorrect;
    
    state.score = state.quizData.filter(q => q.isCorrect).length;
    updateScoreDisplay();
    
    const activeBtn = elements.questionGrid.children[state.currentQuestionIndex];
    activeBtn.classList.add('attempted');
    activeBtn.querySelector('.nav-status').innerHTML = '&#10003;';
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
        const allBtns = Array.from(elements.optionsContainer.children);
        const correctBtn = allBtns.find(btn => btn.dataset.id === qData.answer);
        if (correctBtn) correctBtn.classList.add('correct');
    }
    
    const allBtns = Array.from(elements.optionsContainer.children);
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect')) {
            btn.classList.add('disabled-unselected');
        }
    });

    elements.explanationText.textContent = qData.explanations[selectedId];
    elements.explanationContainer.style.borderLeftColor = isCorrect ? 'var(--correct-border)' : 'var(--incorrect-border)';
    const icon = elements.explanationContainer.querySelector('.info-icon');
    icon.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
    elements.explanationHeader.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
    elements.explanationContainer.classList.remove('hidden');
    
    if (state.quizData.every(q => q.userAnswer)) {
        elements.nextBtn.textContent = 'View Results';
    }
}

function handlePrevQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        renderQuestion();
    }
}

function handleNextQuestion() {
    if (state.quizData.every(q => q.userAnswer)) {
        showResults();
        return;
    }
    
    if (state.currentQuestionIndex < state.quizData.length - 1) {
        state.currentQuestionIndex++;
        renderQuestion();
    } else {
        const firstUnanswered = state.quizData.findIndex(q => !q.userAnswer);
        if (firstUnanswered !== -1) {
            state.currentQuestionIndex = firstUnanswered;
            renderQuestion();
        }
    }
}

function updateScoreDisplay() {
    elements.currentScore.textContent = state.score;
}

function showResults() {
    switchView('results');
    elements.scoreContainer.classList.add('hidden');
    
    const total = state.quizData.length;
    elements.finalScoreVal.textContent = state.score;
    elements.finalScoreTotal.textContent = total;
    
    // Update score circle gradient
    const percentage = (state.score / total) * 100;
    const circleColor = percentage > 75 ? '#10b981' : percentage > 40 ? '#f59e0b' : '#ef4444';
    const circle = document.querySelector('.score-circle');
    circle.style.background = `conic-gradient(${circleColor} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    circle.style.color = circleColor;
    
    if (percentage === 100) {
        elements.resultsMessage.textContent = "Perfect! Excellent work.";
    } else if (percentage >= 70) {
        elements.resultsMessage.textContent = "Great job! You know your stuff.";
    } else {
        elements.resultsMessage.textContent = "Good try! Keep practicing.";
    }
}

function restartQuiz() {
    initQuiz(state.originalData);
}
