// UI Helper Functions
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

function showError(msg) {
    elements.uploadError.textContent = msg;
    elements.uploadError.classList.remove('hidden');
}

function updateScoreDisplay() {
    elements.currentScore.textContent = state.score;
}
