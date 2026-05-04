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
    highlightToggle: document.getElementById('highlight-toggle'),
    
    // Firebase Elements
    loginBtn: document.getElementById('login-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userInfo: document.getElementById('user-info'),
    userName: document.getElementById('user-name'),
    saveCloudBtn: document.getElementById('save-cloud-btn'),
    savedQuizzesContainer: document.getElementById('saved-quizzes-container'),
    savedQuizzesList: document.getElementById('saved-quizzes-list'),
    
    // Landing Page Elements
    mainApp: document.getElementById('main-app'),
    landingView: document.getElementById('landing-view'),
    authTitle: document.getElementById('auth-title'),
    authSubtitle: document.getElementById('auth-subtitle'),
    signupForm: document.getElementById('signup-form'),
    signinForm: document.getElementById('signin-form'),
    authToggleLink: document.getElementById('auth-toggle-link'),
    authToggleQuestion: document.getElementById('auth-toggle-question'),
    guestBtn: document.getElementById('guest-btn'),
    googleLoginBtn: document.getElementById('google-login-btn'),
    themeSelector: document.getElementById('theme-selector'),

    // Password Management Elements
    forgotPasswordLink: document.getElementById('forgot-password-link'),
    forgotPasswordModal: document.getElementById('forgot-password-modal'),
    forgotPasswordForm: document.getElementById('forgot-password-form'),
    cancelResetBtn: document.getElementById('cancel-reset-btn'),
    
    setPasswordModal: document.getElementById('set-password-modal'),
    setPasswordForm: document.getElementById('set-password-form'),
    skipPasswordBtn: document.getElementById('skip-password-btn'),

    // Sidebar Layout Elements
    newQuizBtn: document.getElementById('new-quiz-btn'),
    searchQuizInput: document.getElementById('search-quiz-input'),
    appSidebar: document.getElementById('app-sidebar'),
    mobileSidebarToggle: document.getElementById('mobile-sidebar-toggle'),

    // New Modals & Elements
    toastContainer: document.getElementById('toast-container'),
    
    savePromptModal: document.getElementById('save-prompt-modal'),
    saveQuizNameInput: document.getElementById('save-quiz-name-input'),
    confirmSaveBtn: document.getElementById('confirm-save-btn'),
    cancelSaveBtn: document.getElementById('cancel-save-btn'),

    authRequiredModal: document.getElementById('auth-required-modal'),
    guestGoogleBtn: document.getElementById('guest-google-btn'),
    guestSigninBtn: document.getElementById('guest-signin-btn'),
    guestSignupBtn: document.getElementById('guest-signup-btn'),
    guestCancelBtn: document.getElementById('guest-cancel-btn'),

    guestAuthButtons: document.getElementById('guest-auth-buttons'),
    topSigninBtn: document.getElementById('top-signin-btn'),
    topSignupBtn: document.getElementById('top-signup-btn'),
    
    discardPromptModal: document.getElementById('discard-prompt-modal'),
    confirmDiscardBtn: document.getElementById('confirm-discard-btn'),
    cancelDiscardBtn: document.getElementById('cancel-discard-btn')
};

// Application State
let state = {
    quizData: [],
    currentQuestionIndex: 0,
    score: 0,
    hasAnswered: false,
    highlightMode: false,
    isReviewMode: false,
    hasSaved: false,
    user: null // Firebase user
};
