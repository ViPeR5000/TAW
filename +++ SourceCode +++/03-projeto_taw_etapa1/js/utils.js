// Variáveis globais para chaves de localStorage e Admin
export const USERS_KEY = 'registeredUsers';
export const AUTH_USER_KEY = 'authenticatedUser';
export const ADMIN_USERNAME = 'admin';

/**
 * Lê a lista de utilizadores do localStorage.
 * Garante que o utilizador 'admin' existe.
 * @returns {Array<Object>} Um array de objetos de utilizadores.
 */
export function getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    let users = usersJson ? JSON.parse(usersJson) : [];

    // Por agora, cria um utilizador 'admin' se não existir
    const adminExists = users.some(u => u.username === ADMIN_USERNAME);
    if (!adminExists) {
        const adminUser = {
            username: ADMIN_USERNAME, 
            password: 'password123',
            photoUrl: '', 
            name: 'Administrador',
            email: 'admin@app.com',
            phone: '999999999',
            nif: '999999999',
            address: 'Central Admin',
            isAdmin: true
        };
        users.push(adminUser);
        saveUsers(users); 
    }
    
    return users;
}

/**
 * Guarda a lista atualizada de utilizadores no localStorage.     
 * @param {Array<Object>} users - O array de utilizadores a guardar.
 */
export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Obtém o utilizador autenticado do localStorage.
 * @returns {Object|null} O objeto do utilizador ou null.
 */
export function getAuthenticatedUser() {
    const userJson = localStorage.getItem(AUTH_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Termina a sessão do utilizador e redireciona para a Home.
 */
export function logoutUser() {
    localStorage.removeItem(AUTH_USER_KEY);
    alert('Logout efetuado com sucesso.');
    window.location.href = 'index.html'; 
}


/**
 * Atualiza a barra de navegação para mostrar o link Admin ou Conta dependendo do utilizador.
 */
export function updateNavBar() {
    const navList = document.getElementById('menu');
    if (!navList) return;

    const user = getAuthenticatedUser();
    
    // Remove qualquer link existente de Login/Conta/Admin para evitar duplicação
    const existingLinks = navList.querySelectorAll('li:not(:first-child)');
    existingLinks.forEach(li => li.remove());

    let newLinkHTML = '';

    // Homepage
    newLinkHTML = `<li><a href="index.html">Home</a></li>`;
    navList.insertAdjacentHTML('beforeend', newLinkHTML);

    // Verifica se o admin está logado
    if (user && user.username === ADMIN_USERNAME) {
        newLinkHTML = `<li><a href="admin.html">Painel de Administração</a></li>`;
        navList.insertAdjacentHTML('beforeend', newLinkHTML);
    } 
    else {
        newLinkHTML = `<li><a href="login.html">A minha conta</a></li>`;
        navList.insertAdjacentHTML('beforeend', newLinkHTML);
    }
}