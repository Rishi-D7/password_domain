const firebaseConfig = {
    apiKey: "AIzaSyA1YX4CJFdwoACOwGItX_36stqSdZDa3Bg",
    authDomain: "pass-b6a48.firebaseapp.com",
    projectId: "pass-b6a48",
    storageBucket: "pass-b6a48.appspot.com",
    messagingSenderId: "68168144257",
    appId: "1:68168144257:web:fd0bc39cb3330514808480",
    measurementId: "G-MQ71Z4FGLY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const notification = document.getElementById('notification');

    window.showSignupSection = () => {
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('forgotPasswordSection').classList.remove('active');
        document.getElementById('signupSection').classList.add('active');
    };

    window.showForgotPasswordSection = () => {
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('signupSection').classList.remove('active');
        document.getElementById('forgotPasswordSection').classList.add('active');
    };

    window.showLoginSection = () => {
        document.getElementById('signupSection').classList.remove('active');
        document.getElementById('loginSection').classList.add('active');
    };

    window.showVerifySection = (email) => {
        document.getElementById('loginSection').classList.remove('active');
        document.getElementById('signupSection').classList.remove('active');
        document.getElementById('verifySection').classList.add('active');
        document.getElementById('verifyEmailDisplay').textContent = email;
    };

    window.togglePasswordVisibility = (id) => {
        const input = document.getElementById(id);
        input.type = input.type === 'password' ? 'text' : 'password';
    };

    window.resendVerificationEmail = () => {
        const user = auth.currentUser;
        if (user) {
            user.sendEmailVerification()
                .then(() => showNotification('Verification email resent'))
                .catch(err => showNotification('Failed to resend email: ' + err.message, true));
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                showVerifySection(email);
                showNotification('Please verify your email first');
                return;
            }

            sessionStorage.setItem('masterPassword', password);
            window.location.href = 'onclick.html';
            showNotification('Login Success');
        } catch (error) {
            showNotification('Login failed: ' + error.message, true);
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', true);
            return;
        }

        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', true);
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                user.sendEmailVerification()
                    .then(() => {
                        showVerifySection(email);
                        showNotification('Verification email sent');
                    })
                    .catch(err => showNotification('Failed to send verification: ' + err.message, true));
            })
            .catch((error) => showNotification('Signup failed: ' + error.message, true));
    });

    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        auth.sendPasswordResetEmail(email)
            .then(() => {
                showNotification('Password reset email sent. Please check your inbox.');
                setTimeout(() => showLoginSection(), 3000);
            })
            .catch((error) => showNotification('Failed to send reset email: ' + error.message, true));
    });

    function showNotification(message, isError = false) {
        console.log("Message is displayed");
        
        notification.textContent = message;
        notification.className = `notification ${isError ? 'error' : 'success'} show`;
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }
});