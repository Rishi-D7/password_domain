function generatePassword() {
    const length = document.getElementById('passwordLength').value;
    const uppercase = document.getElementById('uppercase').checked;
    const lowercase = document.getElementById('lowercase').checked;
    const numbers = document.getElementById('numbers').checked;
    const symbols = document.getElementById('symbols').checked;
    
    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    document.getElementById('generatedPassword').value = password;
    updateStrengthMeter(password);
}

function updateStrengthMeter(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const width = strength * 20;
    strengthFill.style.width = `${width}%`;
    
    if (strength <= 2) {
        strengthFill.style.backgroundColor = '#ff5252';
        strengthText.textContent = 'Weak';
    } else if (strength <= 3) {
        strengthFill.style.backgroundColor = '#ffb142';
        strengthText.textContent = 'Medium';
    } else {
        strengthFill.style.backgroundColor = '#33d9b2';
        strengthText.textContent = 'Strong';
    }
}

function copyPassword() {
    const passwordField = document.getElementById('generatedPassword');
    passwordField.select();
    document.execCommand('copy');
    alert('Password copied to clipboard!');
}

function saveToVault() {
    const password = document.getElementById('generatedPassword').value;
    if (password) {
        window.location.href = `vault.html?generated=${encodeURIComponent(password)}`;
    } else {
        alert('Please generate a password first!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('passwordLength').addEventListener('input', function() {
        document.getElementById('lengthValue').textContent = this.value;
    });
    
    generatePassword();
});