// Core Quiz Logic
function reviewQuiz() {
    state.isReviewMode = true;
    state.currentQuestionIndex = 0;
    switchView('quiz');
    elements.scoreContainer.classList.remove('hidden');
    renderQuestion();
}

function initQuiz(data) {
    state.quizData = processAndShuffleQuizData(data);
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.isReviewMode = false;
    
    elements.questionGrid.innerHTML = '';
    state.quizData.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.innerHTML = `
            <span class="nav-num">${index + 1}</span>
            <span class="nav-status">--</span>
        `;
        btn.onclick = () => {
            saveCurrentHighlights();
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
            const isCorrect = state.quizData[idx].isCorrect;
            statusSpan.innerHTML = isCorrect ? '&#10003;' : '&#10007;';
            btn.classList.add(isCorrect ? 'nav-correct' : 'nav-incorrect');
        } else {
            statusSpan.textContent = '--';
            btn.classList.remove('nav-correct', 'nav-incorrect');
        }
    });

    elements.qNum.textContent = state.currentQuestionIndex + 1;
    elements.questionText.innerHTML = qData.questionHtml || qData.question;
    
    elements.optionsContainer.innerHTML = '';

    qData.options.forEach(opt => {
        const optionId = opt[0];
        const optionText = opt[1];
        const optionHtml = opt[2] || optionText;
        
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.id = optionId;
        
        btn.innerHTML = `
            <span class="option-letter">${optionId}</span>
            <span class="option-text">${optionHtml}</span>
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
            
            const explanation = qData.explanations[optionId];
            if (explanation) {
                const reasonDiv = document.createElement('div');
                reasonDiv.className = 'option-reason-text';
                reasonDiv.innerHTML = `<strong>Reason:</strong> ${explanation}`;
                btn.appendChild(reasonDiv);
            }
        }
        
        btn.addEventListener('click', () => handleOptionClick(optionId, btn));
        elements.optionsContainer.appendChild(btn);
    });
    
    if (qData.userAnswer) {
        elements.explanationContainer.classList.add('hidden');
    } else {
        elements.explanationContainer.classList.add('hidden');
    }

    elements.prevBtn.classList.toggle('hidden', state.currentQuestionIndex === 0);
    elements.nextBtn.classList.remove('hidden');
    
    if (state.quizData.every(q => q.userAnswer)) {
        if (state.currentQuestionIndex === state.quizData.length - 1) {
            elements.nextBtn.textContent = 'View Results';
        } else {
            elements.nextBtn.textContent = 'Next';
        }
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
    activeBtn.querySelector('.nav-status').innerHTML = isCorrect ? '&#10003;' : '&#10007;';
    activeBtn.classList.add(isCorrect ? 'nav-correct' : 'nav-incorrect');
    
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
        
        const optId = btn.dataset.id;
        const explanation = qData.explanations[optId];
        if (explanation) {
            const reasonDiv = document.createElement('div');
            reasonDiv.className = 'option-reason-text';
            reasonDiv.innerHTML = `<strong>Reason:</strong> ${explanation}`;
            btn.appendChild(reasonDiv);
        }
    });

    elements.explanationContainer.classList.add('hidden');
    
    if (state.quizData.every(q => q.userAnswer)) {
        if (state.currentQuestionIndex === state.quizData.length - 1) {
            elements.nextBtn.textContent = 'View Results';
        } else {
            elements.nextBtn.textContent = 'Next';
        }
    }
}

function handlePrevQuestion() {
    if (state.currentQuestionIndex > 0) {
        saveCurrentHighlights();
        state.currentQuestionIndex--;
        renderQuestion();
    }
}

function handleNextQuestion() {
    saveCurrentHighlights();
    if (state.quizData.every(q => q.userAnswer) && state.currentQuestionIndex === state.quizData.length - 1) {
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
        } else {
            showResults();
        }
    }
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
