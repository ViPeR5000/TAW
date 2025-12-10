/**
 * Lógica para Registo, Login e Gestão de Sessões
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
        // this.seedAdmin(); // Admin pré-definido removido
        this.checkAccess();
        this.updateUI();
        this.bindEvents();
    }

    /* --- Funcionalidades Principais --- */

    checkAccess() {
        const path = window.location.pathname;
        const isAuth = !!this.currentUser;

        // Proteção de Admin
        if (path.includes('admin.html')) {
            if (!isAuth || this.currentUser.role !== 'admin') {
                window.location.href = 'index.html'; // Redirecionar não-admins
                return;
            }
        }

        // Redirecionar utilizadores autenticados das páginas de Login/Registo
        if (isAuth) {
            if (path.includes('login.html') || path.includes('register.html')) {
                window.location.href = 'profile.html';
            }
        }
        // Redirecionar utilizadores não autenticados da página de Perfil
        else {
            if (path.includes('profile.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    register(userData) {
        // Verificar se username ou email já existe
        const exists = this.users.find(u => u.username === userData.username || u.email === userData.email);
        if (exists) {
            throw new Error('Utilizador ou Correio Eletrónico já existe.');
        }

        // Atribuir Role: Primeiro utilizador é 'admin', outros são 'user'
        userData.role = this.users.length === 0 ? 'admin' : 'user';

        this.users.push(userData);
        this.saveUsers();
        this.login(userData.username, userData.password); // Login automático após registo
    }

    login(usernameOrEmail, password) {
        const user = this.users.find(u =>
            (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
        );

        if (!user) {
            throw new Error('Credenciais inválidas.');
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

    /* --- Interface e Eventos --- */

    updateUI() {
        // Atualizar Navegação
        const nav = document.querySelector('nav ul');
        if (nav) {
            if (this.currentUser) {
                // Utilizador Autenticado
                let menuHtml = `<li><a href="index.html">Início</a></li>`;

                if (this.currentUser.role === 'admin') {
                    menuHtml += `<li><a href="admin.html">Administração</a></li>`;
                }

                menuHtml += `
                    <li><a href="profile.html">A minha conta</a></li>
                    <li><a href="#" id="logoutBtn">Sair (${this.currentUser.username})</a></li>
                `;
                nav.innerHTML = menuHtml;

                // Adicionar listener de logout dinamicamente
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                }
            } else {
                // Utilizador Não Autenticado
                nav.innerHTML = `
                    <li><a href="index.html">Início</a></li>
                    <li><a href="login.html">Entrar</a></li>
                `;
            }
        }

        // Carregar dados do perfil se estiver na página de perfil
        if (this.currentUser && document.getElementById('profile-username')) {
            this.loadProfile();
        }

        // Carregar dados de admin se estiver na página de admin
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
                        <th>Selecioar</th>
                        <th>Fotografia</th>
                        <th>Utilizador</th>
                        <th>Nome</th>
                        <th>Correio Eletrónico</th>
                        <th>NIF</th>
                        <th>Papel</th>
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

        // Associar Evento de Eliminar
        deleteBtn.onclick = () => {
            const usernames = getSelectedUsers();
            if (usernames.length === 0) return alert('Select users first.');
            if (!confirm(`Delete ${usernames.length} users?`)) return;

            this.users = this.users.filter(u => !usernames.includes(u.username));
            this.saveUsers();
            this.loadAdminUsers();
        };

        // Associar Evento de Promover
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

        // Associar Evento de Despromover
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

        // Associar Evento de Limpar Storage
        const clearStorageBtn = document.getElementById('clear-storage-btn');
        if (clearStorageBtn) {
            clearStorageBtn.onclick = () => {
                const confirmMsg = 'ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema!\n\n' +
                    '- Todos os utilizadores registados\n' +
                    '- Todas as sessões ativas\n' +
                    '- Todos os dados armazenados\n\n' +
                    'Esta ação é IRREVERSÍVEL!\n\n' +
                    'Tem a certeza que deseja continuar?';

                if (!confirm(confirmMsg)) return;

                // Confirmação dupla
                const finalConfirm = prompt('Digite "APAGAR TUDO" para confirmar:');
                if (finalConfirm !== 'APAGAR TUDO') {
                    alert('Operação cancelada.');
                    return;
                }

                // Limpar todo o localStorage
                localStorage.clear();
                alert('Todos os dados foram apagados com sucesso!\n\nSerá redirecionado para a página inicial.');
                window.location.href = 'index.html';
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

        // Associar Eventos de Edição de Perfil
        this.bindEditProfile();
    }

    bindEditProfile() {
        const editBtn = document.getElementById('edit-profile-btn');
        const saveBtn = document.getElementById('save-profile-btn');
        const cancelBtn = document.getElementById('cancel-edit-btn');
        const viewMode = document.getElementById('profile-view-mode');
        const editMode = document.getElementById('profile-edit-mode');

        if (!editBtn || !saveBtn || !cancelBtn) return;

        const showError = (msg) => {
            const errDiv = document.getElementById('edit-error-message');
            if (errDiv) {
                errDiv.textContent = msg;
                errDiv.style.display = 'block';
            }
        };

        const hideError = () => {
            const errDiv = document.getElementById('edit-error-message');
            if (errDiv) errDiv.style.display = 'none';
        };

        const validateEmail = (email) => {
            return String(email).toLowerCase().match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
        };

        // Mudar para Modo de Edição
        editBtn.onclick = () => {
            hideError();
            // Preencher campos de edição
            document.getElementById('edit-name').value = this.currentUser.name;
            document.getElementById('edit-email').value = this.currentUser.email;
            document.getElementById('edit-mobile').value = this.currentUser.mobile;
            document.getElementById('edit-nif').value = this.currentUser.nif;
            document.getElementById('edit-address').value = this.currentUser.address;

            viewMode.style.display = 'none';
            editMode.style.display = 'block';
        };

        // Cancelar Edição
        cancelBtn.onclick = () => {
            hideError();
            viewMode.style.display = 'block';
            editMode.style.display = 'none';
        };

        // Guardar Alterações
        saveBtn.onclick = () => {
            hideError();

            const newName = document.getElementById('edit-name').value.trim();
            const newEmail = document.getElementById('edit-email').value.trim();
            const newMobile = document.getElementById('edit-mobile').value.trim();
            const newNif = document.getElementById('edit-nif').value.trim();
            const newAddress = document.getElementById('edit-address').value.trim();
            const photoFile = document.getElementById('edit-photo').files[0];

            // Validação
            if (!newName || !newEmail || !newMobile || !newNif || !newAddress) {
                showError('Todos os campos são obrigatórios.');
                return;
            }

            if (!validateEmail(newEmail)) {
                showError('Email inválido.');
                return;
            }

            if (typeof validaContribuinte === 'function' && !validaContribuinte(newNif)) {
                showError('NIF inválido.');
                return;
            } else if (newNif.length !== 9) {
                showError('NIF deve ter 9 dígitos.');
                return;
            }

            if (newMobile.length < 9) {
                showError('Número de telemóvel inválido.');
                return;
            }

            // Atualizar dados do utilizador
            const updateUser = (photoBase64) => {
                this.currentUser.name = newName;
                this.currentUser.email = newEmail;
                this.currentUser.mobile = newMobile;
                this.currentUser.nif = newNif;
                this.currentUser.address = newAddress;
                if (photoBase64) this.currentUser.photo = photoBase64;

                // Atualizar no array de utilizadores
                const userIndex = this.users.findIndex(u => u.username === this.currentUser.username);
                if (userIndex !== -1) {
                    this.users[userIndex] = this.currentUser;
                    this.saveUsers();
                }

                // Atualizar sessão
                localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));

                // Atualizar visualização
                this.loadProfile();
                viewMode.style.display = 'block';
                editMode.style.display = 'none';
                alert('Perfil atualizado com sucesso!');
            };

            // Processar upload de foto
            if (photoFile) {
                const reader = new FileReader();
                reader.onload = (e) => updateUser(e.target.result);
                reader.readAsDataURL(photoFile);
            } else {
                updateUser(null);
            }
        };
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

        // Handler de Login
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

                // Verificação inicial
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

        // Handler de Registo
        if (window.location.pathname.includes('register.html')) {
            const form = document.querySelector('form');
            if (form) {
                const btn = form.querySelector('.registerbtn');
                const inputs = form.querySelectorAll('input');

                const validateRegister = () => {
                    let isValid = true;
                    let errorMsg = '';

                    // Verificar campos obrigatórios
                    const requiredFields = {
                        'username': 'Utilizador',
                        'psw': 'Senha',
                        'psw-repeat': 'Confirmar Senha',
                        'name': 'Nome',
                        'email': 'Correio Eletrónico',
                        'mobile': 'Telefone',
                        'nif': 'NIF',
                        'address': 'Morada'
                    };

                    for (let fieldId in requiredFields) {
                        const field = form[fieldId];
                        if (field && field.required && !field.value.trim()) {
                            errorMsg = `${requiredFields[fieldId]} é obrigatório.`;
                            isValid = false;
                            break;
                        }
                    }

                    // Validação de correspondência de password
                    if (isValid) {
                        const psw = form.psw.value;
                        const pswRepeat = form['psw-repeat'].value;
                        if (psw !== pswRepeat) {
                            errorMsg = 'As passwords não coincidem.';
                            isValid = false;
                        }
                    }

                    // Validação de força de password
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

                    // Validações Específicas
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

                // Verificação inicial
                validateRegister();

                inputs.forEach(i => i.addEventListener('input', () => {
                    hideError();
                    validateRegister();
                }));

                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    // Verificação Final de Validação antes de processar
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

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});
