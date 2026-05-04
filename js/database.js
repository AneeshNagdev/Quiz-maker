// Firestore Database Logic

function showSavePrompt(promptMsg, suggestedName) {
    return new Promise((resolve) => {
        if (!elements.savePromptModal) return resolve(null);
        
        document.getElementById('save-prompt-subtitle').textContent = promptMsg;
        elements.saveQuizNameInput.value = suggestedName;
        elements.savePromptModal.classList.remove('hidden');
        elements.saveQuizNameInput.focus();

        const cleanup = () => {
            elements.confirmSaveBtn.removeEventListener('click', onConfirm);
            elements.cancelSaveBtn.removeEventListener('click', onCancel);
            elements.savePromptModal.classList.add('hidden');
        };

        const onConfirm = () => {
            cleanup();
            resolve(elements.saveQuizNameInput.value.trim() || suggestedName);
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        elements.confirmSaveBtn.addEventListener('click', onConfirm);
        elements.cancelSaveBtn.addEventListener('click', onCancel);
    });
}

async function saveQuizToCloud(isAutoSave = false) {
    if (!state.user) {
        if (elements.authRequiredModal) {
            elements.authRequiredModal.classList.remove('hidden');
        } else {
            showToast("You must be logged in to save quizzes.", "error");
        }
        return false;
    }

    if (!state.quizData || state.quizData.length === 0) return false;

    try {
        let suggestedName = `Quiz ${new Date().toLocaleDateString()}`;
        if (state.quizData.length > 0 && state.quizData[0].question) {
            // Try to extract a meaningful topic from the first question
            const firstQ = state.quizData[0].question;
            const words = firstQ.split(' ').slice(0, 4).join(' ').replace(/[^a-zA-Z0-9 ]/g, "");
            if (words.length > 3) {
                suggestedName = `${words}... (${new Date().toLocaleDateString()})`;
            }
        }

        const promptMsg = isAutoSave 
            ? "You are starting a new quiz. Enter a name to save your current progress first:"
            : "Enter a name for this quiz:";
            
        const quizName = await showSavePrompt(promptMsg, suggestedName);
        if (quizName === null) return null; // User cancelled

        if (elements.saveCloudBtn) {
            elements.saveCloudBtn.textContent = 'Saving...';
            elements.saveCloudBtn.disabled = true;
        }

        const docRef = await db.collection('users').doc(state.user.uid).collection('quizzes').add({
            name: quizName || suggestedName,
            data: JSON.stringify(state.quizData),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (elements.saveCloudBtn) elements.saveCloudBtn.textContent = 'Saved!';
        
        state.hasSaved = true; // Mark as saved
        showToast("Quiz saved successfully!", "success");

        // Refresh the quiz list
        loadUserQuizzes();
        
        setTimeout(() => {
            if (elements.saveCloudBtn) {
                elements.saveCloudBtn.textContent = 'Save Progress to Cloud';
                elements.saveCloudBtn.disabled = false;
            }
        }, 2000);

        return true;
    } catch (error) {
        console.error("Error saving quiz:", error);
        showToast("Failed to save quiz.", "error");
        if (elements.saveCloudBtn) {
            elements.saveCloudBtn.textContent = 'Save Progress to Cloud';
            elements.saveCloudBtn.disabled = false;
        }
        return false;
    }
}

async function loadUserQuizzes() {
    if (!state.user) return;

    try {
        elements.savedQuizzesList.innerHTML = '<p class="text-sm text-muted">Loading...</p>';
        
        const snapshot = await db.collection('users').doc(state.user.uid).collection('quizzes')
            .orderBy('timestamp', 'desc')
            .get();

        if (snapshot.empty) {
            elements.savedQuizzesList.innerHTML = '<p class="text-sm text-muted">No saved quizzes found.</p>';
            return;
        }

        elements.savedQuizzesList.innerHTML = '';
        
        snapshot.forEach(doc => {
            const quiz = doc.data();
            const btn = document.createElement('button');
            btn.className = 'btn secondary-btn w-full mt-2 text-left';
            
            const dateStr = quiz.timestamp ? quiz.timestamp.toDate().toLocaleDateString() : 'Unknown date';
            
            btn.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${quiz.name || 'Saved Quiz'}</span>
                    <span style="font-size: 0.8rem; opacity: 0.7;">${dateStr}</span>
                </div>
            `;
            
            btn.onclick = () => loadQuizFromCloud(quiz.data);
            elements.savedQuizzesList.appendChild(btn);
        });

    } catch (error) {
        console.error("Error loading quizzes:", error);
        elements.savedQuizzesList.innerHTML = '<p class="text-sm" style="color:var(--incorrect-border)">Error loading quizzes.</p>';
    }
}

function loadQuizFromCloud(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        state.originalData = data;
        
        // Since we already shuffled and processed it when they originally played it,
        // we can just load it straight in to preserve their exact layout and answers.
        state.quizData = data;
        state.currentQuestionIndex = 0;
        state.score = data.filter(q => q.isCorrect).length;
        state.isReviewMode = false;
        
        // Rebuild grid
        elements.questionGrid.innerHTML = '';
        state.quizData.forEach((q, index) => {
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
        
    } catch (e) {
        console.error("Error parsing cloud quiz data:", e);
        showError("Corrupt quiz data found in cloud.");
    }
}
