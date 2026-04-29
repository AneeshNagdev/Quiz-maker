// Initialization and Event Wiring
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

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.generateTextBtn.addEventListener('click', handleGenerateText);
    elements.nextBtn.addEventListener('click', handleNextQuestion);
    elements.prevBtn.addEventListener('click', handlePrevQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
    elements.reviewBtn.addEventListener('click', reviewQuiz);
    elements.highlightToggle.addEventListener('click', toggleHighlightMode);
    
    elements.uploadAnotherBtn.addEventListener('click', () => {
        switchView('upload');
        elements.fileInput.value = '';
        elements.scoreContainer.classList.add('hidden');
    });
    
    elements.themeToggle.addEventListener('click', toggleTheme);
});
