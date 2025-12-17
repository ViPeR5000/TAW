// Adicionar imports **
import { getUsers, saveUsers, getAuthenticatedUser, logoutUser, updateNavBar, ADMIN_USERNAME, AUTH_USER_KEY } from './utils.js';

/**
 * Lê um ficheiro (imagem) e retorna o conteúdo como Data URL (string base64).
 * @param {File} file - O objeto File selecionado pelo utilizador.
 * @returns {Promise<string>} Uma Promise que resolve com o Data URL.
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Atualiza os campos do perfil com os dados do utilizador autenticado.
 */
function renderAccountPage(user) {
    // Seleciona os elementos pelos IDs (definidos estaticamente no HTML)
    const photoUser = document.getElementById('profile-photo');
    const profileGreeting = document.getElementById('profile-greeting');
    const nameUser = document.getElementById('profile-name');
    const usernameUser = document.getElementById('profile-username');
    const emailUser = document.getElementById('profile-email');
    const phoneUser = document.getElementById('profile-phone');
    const nifUser = document.getElementById('profile-nif');
    const addressUser = document.getElementById('profile-address');
        
    if (photoUser && nameUser && usernameUser && nifUser && addressUser) {
            
        // Atualiza a Foto
        // Se photoUrl estiver vazio, usa uma imagem padrão
        photoUser.src = user.photoUrl || 'img/default-profile.png';
        // Atualiza os textos
        profileGreeting.textContent =  `Olá ${user.name}`;
        nameUser.textContent = user.name;
        emailUser.textContent = user.email;
        usernameUser.textContent = user.username;
        phoneUser.textContent = user.phone;
        nifUser.textContent = user.nif;
        addressUser.textContent = user.address;
            
    } else {
        console.error("Erro: Não foi possível encontrar todos os elementos do perfil no DOM para atualização.");
    }
}        

// Espera que todo o HTML seja carregado antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
    
    updateNavBar()

    // Seleção de Elementos DOM
    const authForm = document.getElementById('auth-form');
    const registerFields = document.getElementById('register-fields');
    const toggleRegisterBtn = document.getElementById('toggle-register-btn');
    const submitAuthBtn = document.getElementById('submit-auth-btn');

    const loginRegistoArea = document.getElementById('login-registo-area');
    const contaArea = document.getElementById('conta-area');
    
    // Variável de Estado para controlar o modo (Login ou Registo)
    let isRegisterMode = false;

    // ----------------------------------------------------
    // Alternar entre Login e Registo
    // ----------------------------------------------------
    if (toggleRegisterBtn) {
        toggleRegisterBtn.addEventListener('click', () => {
            isRegisterMode = !isRegisterMode;
            
            // Alterna visibilidade dos campos adicionais
            registerFields.style.display = isRegisterMode ? 'block' : 'none';
            
            // Altera o texto dos elementos DOM
            authForm.querySelector('h3').textContent = isRegisterMode ? 'Registo de Novo Utilizador' : 'Login';
            submitAuthBtn.textContent = isRegisterMode ? 'Registar' : 'Entrar';
            toggleRegisterBtn.textContent = isRegisterMode ? 'Mudar para Login' : 'Mudar para Registo';
            
            // Define o NIF como obrigatório SÓ no modo Registo
            document.getElementById('reg-nif').required = isRegisterMode;

            authForm.reset(); 
        });
    }

    // ----------------------------------------------------
    // Processamento do Formulário (Login/Registo)
    // ----------------------------------------------------
    const user = getAuthenticatedUser()

    if (user) {
        contaArea.style="display: flex;"
        loginRegistoArea.style="display: none;"

        renderAccountPage(user)
        
        const logoutBtnPage = document.getElementById('logout-btn-page');
        if (logoutBtnPage) {
            logoutBtnPage.addEventListener('click', logoutUser);
        }
    }

    if (authForm) {
        authForm.addEventListener('submit', async(event) => {
            event.preventDefault(); 
            
            // Recolha de Dados
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = getUsers(); 

            // Lógica de Registo (Executa se isRegisterMode for TRUE)
            if (isRegisterMode) {
                const photoFile = document.getElementById('reg-photo').files[0];
                let photoDataUrl = '';
                const nif = document.getElementById('reg-nif').value;
                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const phone = document.getElementById('reg-phone').value;
                const address = document.getElementById('reg-address').value;

                if (photoFile) {
                    try {
                        photoDataUrl = await readFileAsDataURL(photoFile);
                    } catch (error) {
                        console.error('Erro ao ler o ficheiro de imagem:', error);
                        alert('ERRO de Registo: Não foi possível ler o ficheiro de imagem.');
                        return;
                    }
                }

                // Validação de NIF
                if (!/^\d{9}$/.test(nif)) {
                    alert('ERRO de Registo: O NIF deve conter 9 dígitos.');
                    return;
                }

                // Validação do tlm
                if (!/^\d{9}$/.test(phone)) {
                    alert('ERRO de Registo: O telemóvel deve conter 9 dígitos.');
                    return;
                }

                // Validação de E-mail
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('ERRO de Registo: Formato de e-mail inválido.');
                    return;
                }

                // Verificar se o utilizador já existe
                if (users.some(u => u.username === username)) {
                    alert('ERRO de Registo: O nome de utilizador já existe. Por favor, escolha outro.');
                    return;
                }
                
                // Criar utilizador
                const newUser = { 
                    username: username, 
                    password: password,
                    photoUrl: photoDataUrl,
                    name: name,
                    email: email,
                    phone: phone,
                    nif: nif,
                    address: address,
                    isAdmin: false,
                };

                // Adiciona o novo utilizador ao array e guarda no localStorage
                users.push(newUser);
                saveUsers(users); // Usando a função importada
                
                alert(`Registo de ${username} BEM-SUCEDIDO! Pode agora fazer Login.`);
                
                // Muda automaticamente para o modo Login após registo
                toggleRegisterBtn.click(); 
                authForm.reset();
                
            } 
            
            // Lógica de Login (Executa se isRegisterMode for FALSE)
            else {
                const userFound = users.find(u => u.username === username);

                // Verificar se o utilizador existe
                if (!userFound) {
                    alert('ERRO de Login: Nome de utilizador não encontrado.');
                    return;
                }

                // Verificar a palavra-passe
                if (userFound.password !== password) {
                    alert('ERRO de Login: Palavra-passe incorreta.');
                    return;
                }
                
                // Criação da sessão (Guarda os dados do utilizador autenticado)
                localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userFound));

                alert(`Login de ${username} BEM-SUCEDIDO!`);
                
                // 5. Redirecionamento para a Home / Admin
                if (userFound.username === ADMIN_USERNAME) {
                    window.location.href = 'admin.html'; // Redireciona o admin para a nova página
                } else {
                    window.location.href = 'login.html'; // Redireciona utilizadores normais para a conta
                }
            }
        });
    }
});