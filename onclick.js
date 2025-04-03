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

auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Navigation function for onclick events
function navigateTo(page) {
    window.location.href = page;
}

// Logout function
function logout() {
    auth.signOut().then(() => {
        sessionStorage.removeItem('masterPassword');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Failed to log out: ' + error.message);
    });
}

// Add hover effects
document.addEventListener('DOMContentLoaded', () => {
    const optionCards = document.querySelectorAll('.option-card');
    const navButtons = document.querySelectorAll('.nav-btn');

    optionCards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 10px 30px rgba(110, 59, 255, 0.3)';
        });
        card.addEventListener('mouseout', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });

    navButtons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 5px 15px rgba(110, 59, 255, 0.2)';
        });
        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });
    });
});