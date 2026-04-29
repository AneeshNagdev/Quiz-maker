// Highlighter Logic
function toggleHighlightMode() {
    state.highlightMode = !state.highlightMode;
    elements.highlightToggle.classList.toggle('active', state.highlightMode);
}

function saveCurrentHighlights() {
    const qData = state.quizData[state.currentQuestionIndex];
    if (!qData) return;
    qData.questionHtml = elements.questionText.innerHTML;
    
    const options = elements.optionsContainer.querySelectorAll('.option-btn');
    options.forEach(btn => {
        const optId = btn.dataset.id;
        const optData = qData.options.find(o => o[0] === optId);
        if (optData) {
            optData[2] = btn.querySelector('.option-text').innerHTML;
        }
    });
    
    if (qData.userAnswer) {
         qData.explanationHtml = elements.explanationText.innerHTML;
    }
}

// Highlight Event Listeners
views.quiz.addEventListener('mouseup', () => {
    if (!state.highlightMode) return;
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        try {
            const mark = document.createElement('mark');
            mark.className = 'quiz-highlight';
            range.surroundContents(mark);
            selection.removeAllRanges();
        } catch(err) {
            console.log("Cannot highlight across multiple elements.");
        }
    }
});

views.quiz.addEventListener('click', (e) => {
    if (state.highlightMode && e.target.tagName.toLowerCase() === 'mark' && e.target.classList.contains('quiz-highlight')) {
        const parent = e.target.parentNode;
        while (e.target.firstChild) {
            parent.insertBefore(e.target.firstChild, e.target);
        }
        parent.removeChild(e.target);
        parent.normalize();
    }
});
