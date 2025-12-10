/**
 * Logic for Registration, Login, and Session Management
 */

const STORAGE_KEY_USERS = 'taw_users';
const STORAGE_KEY_SESSION = 'taw_current_user';

class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS)) || [];
        this.currentUser = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION)) || null;
        this.init();
    }

    init() {
        this.checkAccess();
        this.updateUI();
        this.bindEvents();
    }

    /* --- Core --- */

    checkAccess() {
        const path = window.location.pathname;
        const isAuth = !!this.currentUser;

        // Redirect Logged In users away from Login/Register
        if (isAuth) {
            if (path.includes('login.html') || path.includes('register.html')) {
                window.location.href = 'profile.html';
            }
        }
        // Redirect Logged Out users away from Profile
        else {
            if (path.includes('profile.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    register(userData) {
        // Check if username or email already exists
        const exists = this.users.find(u => u.username === userData.username || u.email === userData.email);
        if (exists) {
            throw new Error('Username or Email already exists.');
        }

        this.users.push(userData);
        this.saveUsers();
        this.login(userData.username, userData.password); // Auto login after register
    }

    login(usernameOrEmail, password) {
        const user = this.users.find(u =>
            (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
        );

        if (!user) {
            throw new Error('Invalid credentials.');
        }

        this.currentUser = user;
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        this.updateUI();
        window.location.href = 'profile.html';
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEY_SESSION);
        this.updateUI();
        window.location.href = 'login.html';
    }

    saveUsers() {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    }

    /* --- UI & Events --- */

    updateUI() {
        // Update Navigation
        const nav = document.querySelector('nav ul');
        if (nav) {
            if (this.currentUser) {
                // Logged In
                nav.innerHTML = `
                    <li><a href="index.html">Home</a></li>
                    <li><a href="profile.html">A minha conta</a></li>
                    <li><a href="#" id="logoutBtn">Logout (${this.currentUser.username})</a></li>
                `;
                // Add logout listener dynamically
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
            } else {
                // Logged Out
                nav.innerHTML = `
                    <li><a href="index.html">Home</a></li>
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                `;
            }
        }

        // Load Profile Data if on profile page
        if (this.currentUser && document.getElementById('profile-username')) {
            this.loadProfile();
        }
    }

    loadProfile() {
        const setContent = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || 'N/A';
        };

        setContent('profile-username', this.currentUser.username);
        setContent('profile-name', this.currentUser.name);
        setContent('profile-email', this.currentUser.email);
        setContent('profile-mobile', this.currentUser.mobile);
        setContent('profile-nif', this.currentUser.nif);
        setContent('profile-address', this.currentUser.address);

        const imgEl = document.getElementById('profile-display-photo');
        const noPhotoEl = document.getElementById('no-photo-text');

        if (this.currentUser.photo) {
            imgEl.src = this.currentUser.photo;
            imgEl.style.display = 'inline-block';
            if (noPhotoEl) noPhotoEl.style.display = 'none';
        } else {
            imgEl.style.display = 'none';
            if (noPhotoEl) noPhotoEl.style.display = 'block';
        }
    }

    bindEvents() {
        // Login Form
        const loginForm = document.querySelector('form[action="login_handler"]'); // We will add this action or ID to the form to identify it
        // Or better, identifying by context
        if (window.location.pathname.includes('login.html')) {
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const username = form.username.value;
                    const password = form.psw.value;

                    try {
                        this.login(username, password);
                    } catch (error) {
                        alert(error.message);
                    }
                });
            }
        }

        // Register Form
        if (window.location.pathname.includes('register.html')) {
            const form = document.querySelector('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    // Simple Validation
                    const psw = form.psw.value;
                    // In a real app we would have a repeat password field

                    // Construct User Object
                    /* 
                       Data required: username/e-mail, nome, e-mail, fotografia, telemóvel, nif, morada 
                       Form fields: username, psw, profilePhoto, name, email, mobile, nif, address
                    */

                    // Handle File Upload (Convert to Base64 for localStorage)
                    const fileInput = form.profilePhoto;
                    let photoData = '';

                    const processRegister = (photoBase64) => {
                        const userData = {
                            username: form.username.value,
                            password: psw,
                            name: form.name.value,
                            email: form.email.value,
                            mobile: form.mobile.value,
                            nif: form.nif.value,
                            address: form.address.value,
                            photo: photoBase64
                        };

                        try {
                            this.register(userData);
                        } catch (error) {
                            alert(error.message);
                        }
                    };

                    if (fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            processRegister(e.target.result);
                        };
                        reader.readAsDataURL(fileInput.files[0]);
                    } else {
                        processRegister(''); // No photo
                    }
                });
            }
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});
