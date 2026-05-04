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
    Object.values(views).forEach(v => v.classList.remove('active-view'));
    views[viewName].classList.add('active-view');
}

function showError(msg) {
    elements.uploadError.textContent = msg;
    elements.uploadError.classList.remove('hidden');
}

function updateScoreDisplay() {
    elements.currentScore.textContent = state.score;
}

function toggleAuthForm(e) {
    e.preventDefault();
    const isSignUp = !elements.signupForm.classList.contains('hidden');
    
    if (isSignUp) {
        elements.signupForm.classList.add('hidden');
        elements.signinForm.classList.remove('hidden');
        elements.authTitle.textContent = 'Welcome back';
        elements.authSubtitle.textContent = 'Enter your details below to sign in';
        elements.authToggleQuestion.textContent = "Don't have an account?";
        elements.authToggleLink.textContent = "Sign up";
    } else {
        elements.signinForm.classList.add('hidden');
        elements.signupForm.classList.remove('hidden');
        elements.authTitle.textContent = 'Create an account';
        elements.authSubtitle.textContent = 'Enter your details below to get started';
        elements.authToggleQuestion.textContent = "Already have an account?";
        elements.authToggleLink.textContent = "Sign in";
    }
}

function handleThemeChange(e) {
    const theme = e.target.value;
    document.body.className = ''; // reset
    if (theme !== 'light') {
        document.body.classList.add(`theme-${theme}`);
    }
}

const motivationalQuotes = [
    { text: "He who sweats more in training bleeds less in war.", author: "Spartan Creed" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "Suffer now and live the rest of your life as a champion.", author: "Muhammad Ali" },
    { text: "Do not pray for an easy life, pray for the strength to endure a difficult one.", author: "Bruce Lee" },
    { text: "You don't get what you wish for. You get what you work for.", author: "Unknown" },
    { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", author: "Pelé" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
    { text: "If you want to master something, teach it. If you want to conquer it, study it until it bleeds.", author: "Unknown" },
    { text: "Discipline equals freedom.", author: "Jocko Willink" }
];

function setRandomQuote() {
    const quoteEl = document.getElementById('landing-quote-text');
    const authorEl = document.getElementById('landing-quote-author');
    if (quoteEl && authorEl) {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        const quote = motivationalQuotes[randomIndex];
        quoteEl.textContent = `"${quote.text}"`;
        authorEl.textContent = `- ${quote.author}`;
    }
}

/**
 * Display a toast notification
 * @param {string} msg - The message to display
 * @param {string} type - 'info', 'success', or 'error'
 */
function showToast(msg, type = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'error') {
        icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--incorrect-border)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else if (type === 'success') {
        icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--correct-border)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    } else {
        icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    
    elements.toastContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Wait for fade out animation
    }, 3000);
}
