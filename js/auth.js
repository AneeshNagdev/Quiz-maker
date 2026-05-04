// Firebase Authentication Logic

function showAuthError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Find the error span specific to this form, or fallback to toast
    const errorSpan = form.querySelector('.auth-error-msg');
    if (errorSpan) {
        // Clean up firebase error message
        let cleanMsg = message.replace('Firebase: ', '');
        cleanMsg = cleanMsg.replace(/\(auth\/.*\)\.?/, '').trim();
        
        errorSpan.textContent = cleanMsg;
        errorSpan.classList.remove('hidden');
    } else {
        showToast(message, 'error');
    }

    // Highlight inputs
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => input.classList.add('input-error'));
}

function clearAuthErrors(e) {
    const form = e.target.closest('form');
    if (!form) return;
    
    const errorSpan = form.querySelector('.auth-error-msg');
    if (errorSpan) {
        errorSpan.classList.add('hidden');
    }
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => input.classList.remove('input-error'));
}

// Attach clear errors to inputs
document.addEventListener('input', (e) => {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.closest('.auth-form')) {
        clearAuthErrors(e);
    }
});

const provider = new firebase.auth.GoogleAuthProvider();

function handleGoogleLogin(e) {
    if (e) e.preventDefault();
    if (window.location.protocol === 'file:') {
        showToast("Google Login requires a web server or GitHub Pages hosting. It does not work on file:///.", "error");
        return;
    }
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Check if user has a password provider
            const hasPassword = user.providerData.some(p => p.providerId === 'password');
            if (!hasPassword) {
                // First time google login, prompt to set password
                if (elements.setPasswordModal) elements.setPasswordModal.classList.remove('hidden');
            }
        })
        .catch((error) => {
            console.error("Login failed:", error);
            showToast("Google Login failed: " + error.message.replace('Firebase: ', ''), "error");
        });
}

function handleEmailSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (password.length < 8) {
        showAuthError('signup-form', "Password must be at least 8 characters long.");
        return;
    }

    if (password !== confirm) {
        showAuthError('signup-form', "Passwords do not match!");
        return;
    }

    const submitBtn = document.getElementById('signup-submit');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Update profile with name
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Force reload to get updated display name
            return auth.currentUser.reload();
        })
        .catch((error) => {
            console.error("Sign up failed:", error);
            showAuthError('signup-form', error.message);
            submitBtn.textContent = 'Create Account';
            submitBtn.disabled = false;
        });
}

function handleEmailSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const submitBtn = document.getElementById('signin-submit');
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            console.error("Sign in failed:", error);
            showAuthError('signin-form', error.message);
            submitBtn.textContent = 'Sign In';
            submitBtn.disabled = false;
        });
}

function handleLogout() {
    // Always transition UI back to landing page
    elements.mainApp.classList.add('hidden');
    elements.landingView.classList.remove('hidden');
    
    // If user is actually signed in, sign them out
    if (auth.currentUser) {
        auth.signOut().catch((error) => {
            console.error("Logout failed:", error);
        });
    }
}

function continueAsGuest(e) {
    e.preventDefault();
    elements.landingView.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
}

// Password Management
function handlePasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const submitBtn = document.getElementById('reset-submit');

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            showToast("Password reset email sent! Please check your inbox.", "success");
            elements.forgotPasswordModal.classList.add('hidden');
            elements.forgotPasswordForm.reset();
        })
        .catch((error) => {
            console.error("Reset failed:", error);
            showAuthError('forgot-password-form', error.message);
        })
        .finally(() => {
            submitBtn.textContent = 'Send Reset Link';
            submitBtn.disabled = false;
        });
}

function handleSetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const submitBtn = document.getElementById('set-password-submit');

    if (newPassword.length < 8) {
        showAuthError('set-password-form', "Password must be at least 8 characters.");
        return;
    }

    submitBtn.textContent = 'Setting...';
    submitBtn.disabled = true;

    auth.currentUser.updatePassword(newPassword)
        .then(() => {
            showToast("Password successfully set!", "success");
            elements.setPasswordModal.classList.add('hidden');
            elements.setPasswordForm.reset();
        })
        .catch((error) => {
            console.error("Set password failed:", error);
            showAuthError('set-password-form', error.message);
        })
        .finally(() => {
            submitBtn.textContent = 'Set Password';
            submitBtn.disabled = false;
        });
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
    state.user = user;

    // Reset buttons
    const signinBtn = document.getElementById('signin-submit');
    if (signinBtn) { signinBtn.textContent = 'Sign In'; signinBtn.disabled = false; }
    const signupBtn = document.getElementById('signup-submit');
    if (signupBtn) { signupBtn.textContent = 'Create Account'; signupBtn.disabled = false; }

    if (user) {
        // User is logged in
        // Hide landing page, show main app
        elements.landingView.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');

        if (elements.userInfo) elements.userInfo.classList.remove('hidden');
        if (elements.logoutBtn) elements.logoutBtn.classList.remove('hidden');

        // Sometimes display name takes a second to sync after registration
        setTimeout(() => {
            if (elements.userName && auth.currentUser) {
                elements.userName.textContent = auth.currentUser.displayName || auth.currentUser.email;
            }
        }, 500);

        // Fetch saved quizzes
        loadUserQuizzes();
    } else {
        // User is logged out
        if (elements.userInfo) elements.userInfo.classList.add('hidden');
        if (elements.logoutBtn) elements.logoutBtn.classList.add('hidden');
        
        if (elements.savedQuizzesList) elements.savedQuizzesList.innerHTML = '';
        
        // Return to landing view
        if (elements.mainApp) elements.mainApp.classList.add('hidden');
        if (elements.landingView) elements.landingView.classList.remove('hidden');
    }
});
