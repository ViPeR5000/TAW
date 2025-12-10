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
        // this.seedAdmin(); // Removed seeded admin
        this.checkAccess();
        this.updateUI();
        this.bindEvents();
    }

    /* --- Core --- */

    checkAccess() {
        const path = window.location.pathname;
        const isAuth = !!this.currentUser;

        // Admin Protection
        if (path.includes('admin.html')) {
            if (!isAuth || this.currentUser.role !== 'admin') {
                window.location.href = 'index.html'; // Kick out non-admins
                return;
            }
        }

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

        // Assign Role: First user is 'admin', others 'user'
        userData.role = this.users.length === 0 ? 'admin' : 'user';

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
                let menuHtml = `<li><a href="index.html">Home</a></li>`;

                if (this.currentUser.role === 'admin') {
                    menuHtml += `<li><a href="admin.html">Administração</a></li>`;
                }

                menuHtml += `
                    <li><a href="profile.html">A minha conta</a></li>
                    <li><a href="#" id="logoutBtn">Logout (${this.currentUser.username})</a></li>
                `;
                nav.innerHTML = menuHtml;

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

        // Load Admin Data if on admin page
        if (this.currentUser && this.currentUser.role === 'admin' && document.getElementById('admin-container')) {
            this.loadAdminUsers();
        }
    }

    loadAdminUsers() {
        const container = document.getElementById('admin-container');
        const deleteBtn = document.getElementById('delete-selected-btn');
        const promoteBtn = document.getElementById('promote-selected-btn');
        const demoteBtn = document.getElementById('demote-selected-btn');

        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Selectionar</th>
                        <th>Photo</th>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>NIF</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (this.users.length === 0) {
            html += `<tr><td colspan="7">No users found.</td></tr>`;
        } else {
            this.users.forEach(user => {
                const isMe = user.username === this.currentUser.username;
                const photoHtml = user.photo ? `<img src="${user.photo}" style="width: 40px; height: 40px; border-radius: 50%;">` : 'No Photo';

                html += `
                    <tr>
                        <td><input type="checkbox" class="user-select" value="${user.username}" ${isMe ? 'disabled' : ''}></td>
                        <td>${photoHtml}</td>
                        <td>${user.username}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.nif}</td>
                        <td>${user.role || 'user'}</td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table>`;
        container.innerHTML = html;
        deleteBtn.style.display = 'inline-block';
        if (promoteBtn) promoteBtn.style.display = 'inline-block';
        if (demoteBtn) demoteBtn.style.display = 'inline-block';

        const getSelectedUsers = () => {
            const checkboxes = document.querySelectorAll('.user-select:checked');
            return Array.from(checkboxes).map(cb => cb.value);
        };

        // Bind Delete Event
        deleteBtn.onclick = () => {
            const usernames = getSelectedUsers();
            if (usernames.length === 0) return alert('Select users first.');
            if (!confirm(`Delete ${usernames.length} users?`)) return;

            this.users = this.users.filter(u => !usernames.includes(u.username));
            this.saveUsers();
            this.loadAdminUsers();
        };

        // Bind Promote Event
        if (promoteBtn) {
            promoteBtn.onclick = () => {
                const usernames = getSelectedUsers();
                if (usernames.length === 0) return alert('Select users first.');

                this.users.forEach(u => {
                    if (usernames.includes(u.username)) u.role = 'admin';
                });
                this.saveUsers();
                this.loadAdminUsers();
            };
        }

        // Bind Demote Event
        if (demoteBtn) {
            demoteBtn.onclick = () => {
                const usernames = getSelectedUsers();
                if (usernames.length === 0) return alert('Select users first.');

                this.users.forEach(u => {
                    if (usernames.includes(u.username)) u.role = 'user';
                });
                this.saveUsers();
                this.loadAdminUsers();
            };
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
        const showError = (msg) => {
            const errDiv = document.getElementById('error-message');
            if (errDiv) {
                errDiv.textContent = msg;
                errDiv.style.display = 'block';
            }
        };

        const hideError = () => {
            const errDiv = document.getElementById('error-message');
            if (errDiv) {
                errDiv.style.display = 'none';
            }
        };

        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };

        // Login Handler
        if (window.location.pathname.includes('login.html')) {
            const form = document.querySelector('form');
            if (form) {
                const btn = form.querySelector('button');
                const inputs = form.querySelectorAll('input');

                const validateLogin = () => {
                    let isValid = true;
                    inputs.forEach(i => {
                        if (i.required && !i.value.trim()) isValid = false;
                    });
                    btn.disabled = !isValid;
                    if (isValid) btn.style.opacity = '1';
                    else btn.style.opacity = '0.5';
                };

                // Initial check
                validateLogin();

                inputs.forEach(i => i.addEventListener('input', () => {
                    hideError();
                    validateLogin();
                }));

                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const username = form.username.value;
                    const password = form.psw.value;

                    try {
                        this.login(username, password);
                    } catch (error) {
                        showError(error.message);
                    }
                });
            }
        }

        // Register Handler
        if (window.location.pathname.includes('register.html')) {
            const form = document.querySelector('form');
            if (form) {
                const btn = form.querySelector('.registerbtn');
                const inputs = form.querySelectorAll('input');

                const validateRegister = () => {
                    let isValid = true;
                    let errorMsg = '';

                    // Check required fields
                    const requiredFields = {
                        'username': 'Username',
                        'psw': 'Password',
                        'psw-repeat': 'Confirm Password',
                        'name': 'Name',
                        'email': 'Email',
                        'mobile': 'Mobile number',
                        'nif': 'NIF',
                        'address': 'Address'
                    };

                    for (let fieldId in requiredFields) {
                        const field = form[fieldId];
                        if (field && field.required && !field.value.trim()) {
                            errorMsg = `${requiredFields[fieldId]} é obrigatório.`;
                            isValid = false;
                            break;
                        }
                    }

                    // Password match validation
                    if (isValid) {
                        const psw = form.psw.value;
                        const pswRepeat = form['psw-repeat'].value;
                        if (psw !== pswRepeat) {
                            errorMsg = 'As passwords não coincidem.';
                            isValid = false;
                        }
                    }

                    // Password strength validation
                    if (isValid) {
                        const psw = form.psw.value;
                        const hasLetter = /[a-zA-Z]/.test(psw);
                        const hasNumber = /[0-9]/.test(psw);
                        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(psw);
                        const minLength = psw.length >= 8;

                        if (!minLength) {
                            errorMsg = 'A password deve ter pelo menos 8 caracteres.';
                            isValid = false;
                        } else if (!hasLetter) {
                            errorMsg = 'A password deve conter pelo menos uma letra.';
                            isValid = false;
                        } else if (!hasNumber) {
                            errorMsg = 'A password deve conter pelo menos um número.';
                            isValid = false;
                        } else if (!hasSymbol) {
                            errorMsg = 'A password deve conter pelo menos um símbolo (!@#$%^&*...).';
                            isValid = false;
                        }
                    }

                    // Specific Validations
                    if (isValid) {
                        const email = form.email.value;
                        if (email && !validateEmail(email)) {
                            errorMsg = 'Email inválido. Por favor, insira um email válido.';
                            isValid = false;
                        }
                    }

                    if (isValid) {
                        const nif = form.nif.value;
                        if (nif) {
                            if (typeof validaContribuinte === 'function') {
                                if (!validaContribuinte(nif)) {
                                    errorMsg = 'NIF inválido. Verifique o número de contribuinte.';
                                    isValid = false;
                                }
                            } else if (nif.length !== 9 || isNaN(nif)) {
                                errorMsg = 'NIF deve ter 9 dígitos numéricos.';
                                isValid = false;
                            }
                        }
                    }

                    if (isValid) {
                        const mobile = form.mobile.value;
                        if (mobile && (mobile.length < 9 || isNaN(mobile))) {
                            errorMsg = 'Número de telemóvel inválido.';
                            isValid = false;
                        }
                    }

                    btn.disabled = !isValid;
                    if (isValid) {
                        btn.style.opacity = '1';
                        hideError();
                    } else {
                        btn.style.opacity = '0.5';
                        if (errorMsg) showError(errorMsg);
                    }
                };

                // Initial check
                validateRegister();

                inputs.forEach(i => i.addEventListener('input', () => {
                    hideError();
                    validateRegister();
                }));

                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    // Final Validation Check before processing
                    const nif = form.nif.value;
                    if (typeof validaContribuinte === 'function') {
                        if (!validaContribuinte(nif)) {
                            showError("Invalid NIF.");
                            return;
                        }
                    } else if (nif.length !== 9) {
                        showError("NIF must have 9 digits.");
                        return;
                    }

                    if (!validateEmail(form.email.value)) {
                        showError("Invalid Email.");
                        return;
                    }

                    const psw = form.psw.value;
                    const fileInput = form.profilePhoto;

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
                            showError(error.message);
                        }
                    };

                    if (fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            processRegister(e.target.result);
                        };
                        reader.readAsDataURL(fileInput.files[0]);
                    } else {
                        processRegister('');
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
