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
                state.hasSaved = false;
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
        state.hasSaved = false;
        initQuiz(data);
    } catch (e) {
        showError(e.message);
    }
}

async function handleNewQuiz() {
    if (state.quizData && state.quizData.length > 0 && !state.hasSaved) {
        // We are in the middle of a quiz, prompt to save
        const saved = await saveQuizToCloud(true);
        if (saved === null) {
            // User cancelled the prompt, do not exit the quiz
            return;
        }
    }
    
    // Reset state and return to upload view
    state.quizData = [];
    state.originalData = [];
    state.currentQuestionIndex = 0;
    state.score = 0;
    
    if (elements.fileInput) elements.fileInput.value = '';
    if (elements.scoreContainer) elements.scoreContainer.classList.add('hidden');
    
    switchView('upload');
    
    // Close mobile sidebar if open
    if (elements.appSidebar && elements.appSidebar.classList.contains('sidebar-open')) {
        elements.appSidebar.classList.remove('sidebar-open');
    }
}

function handleSearchQuiz() {
    const query = elements.searchQuizInput.value.toLowerCase();
    if (!elements.savedQuizzesList) return;
    
    const buttons = elements.savedQuizzesList.querySelectorAll('button');
    buttons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes(query)) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    setRandomQuote();
    
    if(elements.fileInput) elements.fileInput.addEventListener('change', handleFileUpload);
    if(elements.generateTextBtn) elements.generateTextBtn.addEventListener('click', handleGenerateText);
    if(elements.nextBtn) elements.nextBtn.addEventListener('click', handleNextQuestion);
    if(elements.prevBtn) elements.prevBtn.addEventListener('click', handlePrevQuestion);
    if(elements.restartBtn) elements.restartBtn.addEventListener('click', restartQuiz);
    if(elements.reviewBtn) elements.reviewBtn.addEventListener('click', reviewQuiz);
    if(elements.highlightToggle) elements.highlightToggle.addEventListener('click', toggleHighlightMode);
    
    // Sidebar Listeners
    if(elements.newQuizBtn) elements.newQuizBtn.addEventListener('click', handleNewQuiz);
    if(elements.searchQuizInput) elements.searchQuizInput.addEventListener('input', handleSearchQuiz);
    if(elements.mobileSidebarToggle) {
        elements.mobileSidebarToggle.addEventListener('click', () => {
            elements.appSidebar.classList.toggle('sidebar-open');
        });
    }

    // Landing Page Listeners
    if(elements.signupForm) elements.signupForm.addEventListener('submit', handleEmailSignUp);
    if(elements.signinForm) elements.signinForm.addEventListener('submit', handleEmailSignIn);
    if(elements.authToggleLink) elements.authToggleLink.addEventListener('click', toggleAuthForm);
    if(elements.guestBtn) elements.guestBtn.addEventListener('click', continueAsGuest);
    if(elements.themeSelector) elements.themeSelector.addEventListener('change', handleThemeChange);
    
    // Password Management Listeners
    if(elements.forgotPasswordLink) {
        elements.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            elements.forgotPasswordModal.classList.remove('hidden');
        });
    }
    if(elements.cancelResetBtn) {
        elements.cancelResetBtn.addEventListener('click', () => {
            elements.forgotPasswordModal.classList.add('hidden');
        });
    }
    if(elements.forgotPasswordForm) elements.forgotPasswordForm.addEventListener('submit', handlePasswordReset);
    
    if(elements.setPasswordForm) elements.setPasswordForm.addEventListener('submit', handleSetPassword);
    if(elements.skipPasswordBtn) {
        elements.skipPasswordBtn.addEventListener('click', () => {
            elements.setPasswordModal.classList.add('hidden');
        });
    }
    
    // Firebase Listeners
    if(elements.loginBtn) elements.loginBtn.addEventListener('click', handleGoogleLogin);
    if(elements.googleLoginBtn) elements.googleLoginBtn.addEventListener('click', handleGoogleLogin);
    if(elements.logoutBtn) elements.logoutBtn.addEventListener('click', handleLogout);
    if(elements.saveCloudBtn) elements.saveCloudBtn.addEventListener('click', () => saveQuizToCloud(false));
    
    if(elements.uploadAnotherBtn) {
        elements.uploadAnotherBtn.addEventListener('click', handleNewQuiz);
    }

    // Guest Auth Modal Listeners
    if(elements.guestGoogleBtn) {
        elements.guestGoogleBtn.addEventListener('click', (e) => {
            elements.authRequiredModal.classList.add('hidden');
            handleGoogleLogin(e);
        });
    }
    
    if(elements.guestSigninBtn) {
        elements.guestSigninBtn.addEventListener('click', () => {
            elements.authRequiredModal.classList.add('hidden');
            elements.mainApp.classList.add('hidden');
            elements.landingView.classList.remove('hidden');
            
            // Ensure signin is visible
            if(elements.signinForm.classList.contains('hidden')) {
                toggleAuthForm(new Event('click'));
            }
        });
    }

    if(elements.guestSignupBtn) {
        elements.guestSignupBtn.addEventListener('click', () => {
            elements.authRequiredModal.classList.add('hidden');
            elements.mainApp.classList.add('hidden');
            elements.landingView.classList.remove('hidden');
            
            // Ensure signup is visible
            if(elements.signupForm.classList.contains('hidden')) {
                toggleAuthForm(new Event('click'));
            }
        });
    }

    if(elements.guestCancelBtn) {
        elements.guestCancelBtn.addEventListener('click', () => {
            elements.authRequiredModal.classList.add('hidden');
        });
    }

    // Password Visibility Toggle Logic
    const toggleIcons = document.querySelectorAll('.password-toggle-icon');
    toggleIcons.forEach(icon => {
        const input = icon.previousElementSibling;
        if (!input || input.tagName.toLowerCase() !== 'input') return;

        const showPassword = (e) => {
            e.preventDefault();
            input.type = 'text';
        };

        const hidePassword = (e) => {
            e.preventDefault();
            input.type = 'password';
        };

        // Mouse events
        icon.addEventListener('mousedown', showPassword);
        icon.addEventListener('mouseup', hidePassword);
        icon.addEventListener('mouseleave', hidePassword);
        
        // Touch events for mobile
        icon.addEventListener('touchstart', showPassword, {passive: false});
        icon.addEventListener('touchend', hidePassword);
        icon.addEventListener('touchcancel', hidePassword);
    });
});
