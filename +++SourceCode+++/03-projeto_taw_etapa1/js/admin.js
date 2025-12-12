import { getUsers, saveUsers, getAuthenticatedUser, logoutUser, updateNavBar, ADMIN_USERNAME } from './utils.js';

/**
 * Remove um utilizador pelo seu username e atualiza a tabela.
 * @param {string} usernameToRemove - O username do utilizador a remover.
 */
function removeUser(usernameToRemove) {
    if (usernameToRemove === ADMIN_USERNAME) {
        alert('Não é permitido remover o utilizador administrador principal.');
        return;
    }
    
    if (confirm(`Tem certeza que deseja remover o utilizador: ${usernameToRemove}?`)) {
        let users = getUsers();
        // Filtra para criar um novo array sem o utilizador a remover
        const updatedUsers = users.filter(user => user.username !== usernameToRemove);
        
        saveUsers(updatedUsers); // Guarda a lista atualizada
        renderUsersTable(updatedUsers); // Renderiza novamente a tabela
        alert(`Utilizador ${usernameToRemove} removido com sucesso.`);
    }
}

/**
 * Cria e injeta a tabela de utilizadores no DOM da página de administração.
 * @param {Array<Object>} users - O array de objetos de utilizadores.
 */
function renderUsersTable(users) {
    const container = document.getElementById('users-table-container');
    if (!container) return; 

    // Excluir o próprio admin da lista exibida
    const nonAdminUsers = users.filter(u => u.username !== ADMIN_USERNAME); 

    let htmlContent = '';

    if (nonAdminUsers.length === 0) {
        htmlContent += '<p>Nenhum outro utilizador registado (apenas o Admin).</p>';
    } else {
        htmlContent += `
            <table id="users-table">
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Username</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>NIF</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        nonAdminUsers.forEach(user => {
            // Assume uma imagem padrão se photoUrl for vazio
            const photoSrc = user.photoUrl || 'img/default-profile.png';
            htmlContent += `
                <tr>
                    <td><img src="${photoSrc}" alt="Foto"></td>
                    <td>${user.username}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.nif}</td>
                    <td><button class="remove-btn" data-username="${user.username}">Remover</button></td>
                </tr>
            `;
        });

        htmlContent += '</tbody></table>';
    }

    container.innerHTML = htmlContent;

    // Adicionar event listeners aos botões de remoção
    container.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const usernameToRemove = event.target.getAttribute('data-username');
            removeUser(usernameToRemove);
        });
    });
}


// Lógica principal da página de Admin) ---
document.addEventListener('DOMContentLoaded', () => {
    const adminArea = document.getElementById('admin-area');
    const user = getAuthenticatedUser();

    updateNavBar();

    if (adminArea) {
        // Verificar se o utilizador está logado E é o admin
        if (user && user.username === ADMIN_USERNAME) {

            const users = getUsers();
            renderUsersTable(users);
            
            const logoutBtnAdmin = document.getElementById('logout-btn-page');
            if (logoutBtnAdmin) {
                logoutBtnAdmin.addEventListener('click', logoutUser);
            }

        } else {
            // Não é o admin ou não está logado, mostrar mensagem de erro
            adminArea.innerHTML = `
                <h2>Acesso Restrito</h2>
                <p>Apenas o administrador (${ADMIN_USERNAME}) tem acesso a esta página.</p>
                <p><a href="login.html">Fazer Login</a></p>
            `;
        }
    }
});