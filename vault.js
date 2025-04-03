const firebaseConfig = {
    apiKey: "AIzaSyA1YX4CJFdwoACOwGItX_36stqSdZDa3Bg",
    authDomain: "pass-b6a48.firebaseapp.com",
    projectId: "pass-b6a48",
    storageBucket: "pass-b6a48.appspot.com",
    messagingSenderId: "68168144257",
    appId: "1:68168144257:web:fd0bc39cb3330514808480",
    measurementId: "G-MQ71Z4FGLY",
    databaseURL: "https://pass-b6a48-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

class PasswordManager {
    constructor() {
        this.passwords = [];
        this.currentCategory = null;
        this.masterKey = null;
    }

    async setMasterKey(masterPassword) {
        const encoder = new TextEncoder();
        const data = encoder.encode(masterPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        this.masterKey = await crypto.subtle.importKey(
            'raw',
            hashBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encryptPassword(password) {
        if (!this.masterKey) throw new Error('Master key not set');
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.masterKey,
            data
        );
        return {
            encrypted: Array.from(new Uint8Array(encryptedData)),
            iv: Array.from(iv)
        };
    }

    async decryptPassword(encryptedObj) {
        if (!this.masterKey) throw new Error('Master key not set');
        const encryptedData = new Uint8Array(encryptedObj.encrypted);
        const iv = new Uint8Array(encryptedObj.iv);
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            this.masterKey,
            encryptedData
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    }

    async loadPasswords() {
        const user = auth.currentUser;
        if (!user) return;

        db.ref('passwords/' + user.uid).on('value', async (snapshot) => {
            const data = snapshot.val();
            this.passwords = [];
            
            if (data) {
                this.passwords = await Promise.all(Object.entries(data).map(async ([id, entry]) => {
                    try {
                        const decryptedPassword = await this.decryptPassword(entry.password);
                        return { id, ...entry, password: decryptedPassword };
                    } catch (error) {
                        console.error('Error decrypting password:', error);
                        return { id, ...entry, password: '**Error Decrypting**' };
                    }
                }));
            }
            if (this.currentCategory) this.renderPasswords();
        });
    }

    async addPassword(website, username, password) {
        const user = auth.currentUser;
        if (!user || !this.currentCategory) return false;

        try {
            const encryptedPassword = await this.encryptPassword(password);
            const newPassword = {
                userId: user.uid,
                website,
                username,
                password: encryptedPassword,
                category: this.currentCategory,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            };

            const newRef = db.ref('passwords/' + user.uid).push();
            await newRef.set(newPassword);
            return true;
        } catch (error) {
            console.error('Error adding password:', error);
            return false;
        }
    }

    async deletePassword(id) {
        const user = auth.currentUser;
        if (!user) return;
        await db.ref('passwords/' + user.uid + '/' + id).remove();
    }

    renderPasswords() {
        if (!this.currentCategory) return;

        const passwordList = document.getElementById('passwordList');
        const categoryPasswords = document.getElementById('categoryPasswords');
        const filtered = this.passwords.filter(p => p.category === this.currentCategory);

        categoryPasswords.textContent = filtered.length;
        passwordList.innerHTML = filtered.map(p => `
            <div class="password-entry fade-in">
                <div class="entry-header">
                    <h3><i class="fas fa-globe"></i> ${p.website}</h3>
                    <button class="delete-btn" onclick="passwordManager.deletePassword('${p.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="entry-details">
                    <p><i class="fas fa-user"></i> ${p.username}</p>
                    <div class="password-field">
                        <i class="fas fa-key"></i>
                        <span class="password-hidden">••••••••</span>
                        <button class="show-btn" onclick="toggleEntryPassword(this, '${p.password}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

const passwordManager = new PasswordManager();

document.addEventListener('DOMContentLoaded', async () => {
    auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            const masterPassword = sessionStorage.getItem('masterPassword');
            if (!masterPassword) {
                window.location.href = 'login.html';
                return;
            }
            await passwordManager.setMasterKey(masterPassword);
            passwordManager.loadPasswords();
        }
    });

    document.getElementById('passwordForm').addEventListener('submit', async e => {
        e.preventDefault();
        const website = document.getElementById('website').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (await passwordManager.addPassword(website, username, password)) {
            e.target.reset();
        }
    });

    // Check for generated password from generator page
    const urlParams = new URLSearchParams(window.location.search);
    const generatedPassword = urlParams.get('generated');
    if (generatedPassword) {
        document.getElementById('password').value = decodeURIComponent(generatedPassword);
    }
});

function selectCategory(category) {
    passwordManager.currentCategory = category;
    document.getElementById('vaultContent').classList.remove('hidden');
    document.querySelector('.category-grid').style.display = 'none';
    document.getElementById('categoryTitle').textContent = category.charAt(0).toUpperCase() + category.slice(1) + ' Passwords';
    passwordManager.renderPasswords();
}

function hideCategory() {
    document.getElementById('vaultContent').classList.add('hidden');
    document.querySelector('.category-grid').style.display = 'grid';
    passwordManager.currentCategory = null;
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling.querySelector('i');
    input.type = input.type === 'password' ? 'text' : 'password';
    toggleBtn.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

function toggleEntryPassword(button, password) {
    const passwordSpan = button.parentElement.querySelector('.password-hidden');
    const isHidden = passwordSpan.textContent === '••••••••';
    passwordSpan.textContent = isHidden ? password : '••••••••';
    button.innerHTML = isHidden ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

function showHelp() {
    window.location.href = 'help.html';
}

function showContact() {
    window.location.href = 'contact.html';
}

function logout() {
    auth.signOut().then(() => {
        sessionStorage.removeItem('masterPassword');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}