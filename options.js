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
    if (!user) window.location.href = 'login.html';
});

function navigateTo(page) {
    window.location.href = page;
}

function logout() {
    auth.signOut().then(() => {
        sessionStorage.removeItem('masterPassword');
        window.location.href = 'login.html';
    }).catch(error => alert('Logout failed: ' + error.message));
}