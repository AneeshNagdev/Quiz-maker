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
    const blocks = rawText.split(/Question\s*\d+\.\s*/i).filter(b => b.trim());
    const data = [];

    blocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        
        let questionTextLines = [];
        let options = [];
        let answer = "";
        let parsingMode = "question";

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.match(/^[A-Z]\.\s+/i)) {
                parsingMode = "options";
                const letter = line.charAt(0).toUpperCase();
                const text = line.substring(2).trim();
                options.push([letter, text]);
            } else if (line.match(/^Answer:\s*[A-Z]/i)) {
                answer = line.split(':')[1].trim().toUpperCase();
            } else if (parsingMode === "question") {
                questionTextLines.push(line);
            }
        }

        const questionText = questionTextLines.join(' ');
        
        if (!questionText || options.length === 0 || !answer) {
            throw new Error(`Failed to parse Question block. Please make sure you follow the required format exactly.`);
        }

        const explanations = {};
        options.forEach(opt => {
            explanations[opt[0]] = opt[0] === answer ? "Correct." : "Incorrect.";
        });

        data.push({
            question: questionText,
            options: options,
            answer: answer,
            explanations: explanations
        });
    });

    if (data.length === 0) {
        throw new Error("No valid questions found.");
    }
    
    return data;
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
    
    elements.uploadError.classList.add('hidden');
    elements.totalQuestions.textContent = state.quizData.length;
    elements.qTotal.textContent = state.quizData.length;
    elements.scoreContainer.classList.remove('hidden');
    
    updateScoreDisplay();
    switchView('quiz');
    renderQuestion();
}

function renderQuestion() {
    state.hasAnswered = false;
    const qData = state.quizData[state.currentQuestionIndex];
    
    elements.qNum.textContent = state.currentQuestionIndex + 1;
    elements.questionText.textContent = qData.question;
    
    // Clear previous options and explanations
    elements.optionsContainer.innerHTML = '';
    elements.explanationContainer.classList.add('hidden');
    elements.cardFooter.classList.add('hidden');

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
        
        btn.addEventListener('click', () => handleOptionClick(optionId, btn));
        elements.optionsContainer.appendChild(btn);
    });
}

function handleOptionClick(selectedId, selectedBtn) {
    if (state.hasAnswered) return;
    state.hasAnswered = true;
    
    const qData = state.quizData[state.currentQuestionIndex];
    const isCorrect = selectedId === qData.answer;
    
    if (isCorrect) {
        state.score++;
        updateScoreDisplay();
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
        // Highlight the correct answer
        const allBtns = Array.from(elements.optionsContainer.children);
        const correctBtn = allBtns.find(btn => btn.dataset.id === qData.answer);
        if (correctBtn) correctBtn.classList.add('correct');
    }
    
    // Disable all buttons and dim unselected
    const allBtns = Array.from(elements.optionsContainer.children);
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect')) {
            btn.classList.add('disabled-unselected');
        }
    });

    // Show explanation for the selected option
    elements.explanationText.textContent = qData.explanations[selectedId];
    
    // Theme the explanation based on whether it was correct or incorrect
    elements.explanationContainer.style.borderLeftColor = isCorrect ? 'var(--correct-border)' : 'var(--incorrect-border)';
    const icon = elements.explanationContainer.querySelector('.info-icon');
    icon.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
    elements.explanationHeader.style.color = isCorrect ? 'var(--correct-text)' : 'var(--incorrect-text)';
    
    elements.explanationContainer.classList.remove('hidden');
    
    // Show next button
    if (state.currentQuestionIndex === state.quizData.length - 1) {
        elements.nextBtn.textContent = 'Finish Quiz';
    } else {
        elements.nextBtn.textContent = 'Next Question';
    }
    elements.cardFooter.classList.remove('hidden');
}

function handleNextQuestion() {
    if (state.currentQuestionIndex < state.quizData.length - 1) {
        state.currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
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
