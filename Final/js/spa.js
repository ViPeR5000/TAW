
// Determinar URL da API com base no ambiente (http vs file)
const API_BASE_URL = (window.location.protocol === 'file:')
    ? 'http://localhost:3001/api'
    : '/api';

// --- estado
function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
    return !!getToken();
}

// --- Navegacao
function showView(viewId) {
    // Verificacao de permissoes para admin
    if (viewId === 'admin-view') {
        const user = getUser();
        if (!isLoggedIn() || !user || !user.isAdmin) {
            alert('Acesso negado: Requer permissões de Administrador.');
            showView('home-view');
            return;
        }
    }

    // Esconder todas as views
    document.querySelectorAll('.spa-view').forEach(view => {
        view.classList.remove('active-view');
    });

    // Mostrar view selecionada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active-view');
    }

    // Atualizar Navbar
    updateNavbar();

    //  logica da view
    if (viewId === 'profile-view') {
        if (!isLoggedIn()) {
            showView('login-view');
        } else {
            loadProfile();
        }
    } else if (viewId === 'admin-view') {
        loadAdminUsers();
    }
}

function updateNavbar() {
    const loggedIn = isLoggedIn();
    const user = getUser();

    const navLogin = document.getElementById('nav-login');
    const navProfile = document.getElementById('nav-profile');
    const navLogout = document.getElementById('nav-logout');

    // Remover link de admin antigo se existir para recriar conforme estado
    const existingAdminLink = document.getElementById('nav-admin');
    if (existingAdminLink) existingAdminLink.remove();

    if (loggedIn) {
        if (navLogin) navLogin.style.display = 'none';
        if (navProfile) navProfile.style.display = 'inline-block';
        if (navLogout) navLogout.style.display = 'inline-block';

        // Adicionar link de Admin se for admin
        if (user && user.isAdmin) {
            const ul = document.querySelector('nav ul');
            const swLi = document.createElement('li');
            swLi.id = 'nav-admin';
            swLi.innerHTML = '<a href="#" onclick="showView(\'admin-view\')">Administração</a>';
            // Inserir antes do Logout
            ul.insertBefore(swLi, navLogout);
        }

    } else {
        if (navLogin) navLogin.style.display = 'inline-block';
        if (navProfile) navProfile.style.display = 'none';
        if (navLogout) navLogout.style.display = 'none';
    }
}

//autenticacao

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const identifier = document.getElementById('login-username').value;
    const password = document.getElementById('login-psw').value;
    const errorDiv = document.getElementById('login-error-message');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (response.ok) {
            setToken(data.token);
            setUser(data.user); // Guardar info do user
            form.reset();
            updateNavbar(); // Forçar update imediato

            // Redirecionar para admin se for admin, senao profile
            if (data.user.isAdmin) {
                showView('admin-view');
            } else {
                showView('profile-view');
            }
        } else {
            showError(errorDiv, data.message || 'Erro no login.');
        }
    } catch (error) {
        showError(errorDiv, 'Erro de ligacao ao servidor.');
        console.error(error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const errorDiv = document.getElementById('register-error-message');

    // Validacao de password
    const psw = document.getElementById('reg-psw').value;
    const pswRepeat = document.getElementById('reg-psw-repeat').value;

    if (psw !== pswRepeat) {
        showError(errorDiv, 'As passwords não coincidem.');
        return;
    }

    //  foto
    const photoFile = document.getElementById('reg-profilePhoto').files[0];
    let photoBase64 = '';

    if (photoFile) {
        try {
            photoBase64 = await toBase64(photoFile);
        } catch (e) {
            showError(errorDiv, 'Erro ao processar imagem.');
            return;
        }
    }

    const userData = {
        username: document.getElementById('reg-username').value,
        password: psw,
        nome: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        telemovel: document.getElementById('reg-mobile').value,
        nif: document.getElementById('reg-nif').value,
        morada: document.getElementById('reg-address').value,
        fotografia: photoBase64
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registo efetuado com sucesso! Faça login.');
            form.reset();
            showView('login-view');
        } else {
            const errorText = await response.text();
            try {
                const errJson = JSON.parse(errorText);
                showError(errorDiv, errJson.message || 'Erro desconhecido no registo.');
            } catch (e) {
                if (response.status === 413) {
                    showError(errorDiv, 'A imagem é demasiado grande. Tente uma imagem mais pequena.');
                } else {
                    showError(errorDiv, `Erro do servidor (${response.status}): ${errorText.substring(0, 50)}...`);
                }
            }
        }
    } catch (error) {
        showError(errorDiv, 'Erro de ligação ao servidor: ' + error.message);
    }
}

function logout() {
    removeToken();
    localStorage.removeItem('user');
    updateNavbar();
    showView('login-view');
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-name').textContent = user.nome;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-mobile').textContent = user.telemovel || 'N/A';
            document.getElementById('profile-nif').textContent = user.nif || 'N/A';
            document.getElementById('profile-address').textContent = user.morada || 'N/A';

            const imgEl = document.getElementById('profile-display-photo');
            const noPhotoEl = document.getElementById('no-photo-text');

            if (user.fotografia) {
                imgEl.src = user.fotografia;
                imgEl.style.display = 'inline-block';
                if (noPhotoEl) noPhotoEl.style.display = 'none';
            } else {
                imgEl.style.display = 'none';
                if (noPhotoEl) noPhotoEl.style.display = 'block';
            }
        } else {
            if (response.status === 401 || response.status === 403) {
                logout();
            } else {
                alert('Erro ao carregar perfil: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

// --- Admin ---

async function loadAdminUsers() {
    const container = document.getElementById('admin-container');
    const errorDiv = document.getElementById('admin-error-message');

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Correção: O controller devolve { success: true, users: [...] }
            renderAdminTable(data.users);
        } else {
            if (response.status === 403) {
                alert('Não tem permissão para ver esta lista.');
                showView('home-view');
            } else {
                showError(errorDiv, 'Erro ao carregar utilizadores.');
            }
        }
    } catch (error) {
        showError(errorDiv, 'Erro de ligação.');
    }
}

function renderAdminTable(users) {
    const container = document.getElementById('admin-container');
    const deleteBtn = document.getElementById('delete-selected-btn');
    const currentUser = getUser();

    if (!users || users.length === 0) {
        container.innerHTML = '<p>Nenhum utilizador encontrado.</p>';
        return;
    }

    let html = `
        <table border="1" style="width:100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th>Sel.</th>
                    <th>Foto</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Nome</th>
                    <th>Admin?</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(u => {
        const isMe = (currentUser && u.username === currentUser.username);
        const photoHtml = u.fotografia
            ? `<img src="${u.fotografia}" style="width: 30px; height: 30px; border-radius: 50%;">`
            : 'N/A';

        html += `
            <tr>
                <td style="text-align:center;">
                    <input type="checkbox" class="user-select-cb" value="${u._id}" ${isMe ? 'disabled' : ''}>
                </td>
                <td style="text-align:center;">${photoHtml}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td>${u.nome}</td>
                <td style="text-align:center;">${u.isAdmin ? '<strong>SIM</strong>' : 'Não'}</td>
                <td style="text-align:center;">
                    ${!isMe ? `<button onclick="deleteUser('${u._id}')" style="background-color: #ff4444; color: white; border: none; padding: 5px 10px; cursor: pointer;">X</button>` : '<span style="color:gray">(Eu)</span>'}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Mostrar botão de apagar global
    if (deleteBtn) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.onclick = deleteSelectedUsers;
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            alert('Utilizador eliminado.');
            loadAdminUsers(); // Recarregar tabela
        } else {
            alert('Erro ao eliminar utilizador.');
        }
    } catch (e) {
        alert('Erro de ligação.');
    }
}

async function deleteSelectedUsers() {
    const checkboxes = document.querySelectorAll('.user-select-cb:checked');
    const ids = Array.from(checkboxes).map(cb => cb.value);

    if (ids.length === 0) {
        alert('Selecione pelo menos um utilizador.');
        return;
    }

    if (!confirm(`Tem a certeza que deseja eliminar ${ids.length} utilizadores?`)) return;

    // Eliminar um a um (ou podia criar endpoint de bulk delete, mas vamos simplificar)
    for (const id of ids) {
        await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
    }

    alert('Operação concluída.');
    loadAdminUsers();
}

//inicializacao

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    showView('home-view');
});

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const errorDiv = document.getElementById('register-error-message');

    // Validacao de password
    const psw = document.getElementById('reg-psw').value;
    const pswRepeat = document.getElementById('reg-psw-repeat').value;

    if (psw !== pswRepeat) {
        showError(errorDiv, 'As passwords não coincidem.');
        return;
    }

    // FormData para envio de ficheiros
    const formData = new FormData();
    formData.append('username', document.getElementById('reg-username').value);
    formData.append('password', psw);
    formData.append('nome', document.getElementById('reg-name').value);
    formData.append('email', document.getElementById('reg-email').value);
    formData.append('telemovel', document.getElementById('reg-mobile').value);
    formData.append('nif', document.getElementById('reg-nif').value);
    formData.append('morada', document.getElementById('reg-address').value);

    // Foto
    const photoFile = document.getElementById('reg-profilePhoto').files[0];
    if (photoFile) {
        formData.append('fotografia', photoFile); // 'fotografia' deve bater certo com upload.single('fotografia') no backend
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            // headers: { 'Content-Type': 'multipart/form-data' }, // NÃO adicionar Content-Type manualmente com FormData, o browser faz isso e adiciona o boundary correto!
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registo efetuado com sucesso! Faça login.');
            form.reset();
            showView('login-view');
        } else {
            // Tentar ler como JSON, se falhar ler como texto
            const errorText = await response.text();
            try {
                const errJson = JSON.parse(errorText);
                showError(errorDiv, errJson.message || 'Erro desconhecido no registo.');
            } catch (e) {
                // Se não for JSON (ex: 413 Payload Too Large que retorna HTML)
                console.error('Erro não-JSON:', errorText);
                // Detetar 413 explicitamente
                if (response.status === 413) {
                    showError(errorDiv, 'A imagem é demasiado grande. Tente uma imagem mais pequena ou reinicie o servidor se alterou o limite.');
                } else {
                    showError(errorDiv, `Erro do servidor (${response.status}): ${errorText.substring(0, 50)}...`);
                }
            }
        }
    } catch (error) {
        showError(errorDiv, 'Erro de ligação ao servidor: ' + error.message);
        console.error(error);
    }
}

function logout() {
    removeToken();
    showView('login-view');
}

//perfil

async function loadProfile() {
    const errorDiv = document.getElementById('edit-error-message');

    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('profile-username').textContent = user.username;
            document.getElementById('profile-name').textContent = user.nome;
            document.getElementById('profile-email').textContent = user.email;
            document.getElementById('profile-mobile').textContent = user.telemovel || 'N/A';
            document.getElementById('profile-nif').textContent = user.nif || 'N/A';
            document.getElementById('profile-address').textContent = user.morada || 'N/A';

            const imgEl = document.getElementById('profile-display-photo');
            const noPhotoEl = document.getElementById('no-photo-text');

            if (user.fotografia) {
                imgEl.src = user.fotografia;
                imgEl.style.display = 'inline-block';
                if (noPhotoEl) noPhotoEl.style.display = 'none';
            } else {
                imgEl.style.display = 'none';
                if (noPhotoEl) noPhotoEl.style.display = 'block';
            }
        } else {
            if (response.status === 401 || response.status === 403) {
                logout(); // Token inválido 
            } else {
                alert('Erro ao carregar perfil: ' + data.message);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
    }
}

//  alertas

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    } else {
        alert(message);
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

//inicializacao

document.addEventListener('DOMContentLoaded', () => {

    updateNavbar();

    // Se tiver hash na URL, pode usar a home.
    showView('home-view');
});
