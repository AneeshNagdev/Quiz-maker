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
    generateTextBtn: document.getElementById('generate-text-btn'),
    reviewBtn: document.getElementById('review-btn'),
    highlightToggle: document.getElementById('highlight-toggle')
};

// Application State
let state = {
    quizData: [],
    currentQuestionIndex: 0,
    score: 0,
    hasAnswered: false,
    highlightMode: false,
    isReviewMode: false
};
