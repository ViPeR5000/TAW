const User = require('../models/Users'); // Importa o modelo Mongoose
const jwt = require('jsonwebtoken');     // Para criar tokens de sessão
const JWT_SECRET = 'a_vossa_chave_secreta_muito_segura';
const TOKEN_EXPIRATION = '1h';

exports.register = async (req, res) => {
    try {
        const { username, email, password, nome, nif, morada, telemovel, fotografia } = req.body;

        // Verificar se o utilizador já existe
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username ou Email já estão em uso.'
            });
        }

        // Criar novo utilizador
        // NOTA: A password deve ser hashada antes de guardar em produção (bcrypt), 
        // mas seguindo o exemplo do login fornecido, manteremos simples por enquanto ou usaremos o bcrypt se já estiver importado no server.js (o server.js tem bcrypt, mas o controller não)
        // O user pediu para implementar login com password simples no request anterior. Vou manter simples aqui também para consistência, mas o ideal era bcrypt.
        // Contudo, server.js tem `const bcrypt = require('bcrypt');`, talvez deva usar? 
        // O código de login fornecido pelo user fazia `if(password != user.password)`, comparação direta. Então vou guardar em plain text para compatibilidade com o login fornecido.

        // Verificar se é o primeiro utilizador registado
        const userCount = await User.countDocuments({});
        const isFirstUser = userCount === 0;

        console.log(`[Registo] Contagem de utilizadores existentes: ${userCount}`);
        console.log(`[Registo] Is First User? ${isFirstUser}`);

        const newUser = new User({
            username,
            email,
            password, // Plain text conforme lógica de login atual
            nome,
            nif,
            morada,
            telemovel,
            fotografia,
            isAdmin: isFirstUser // Se for o primeiro, é admin
        });

        await newUser.save();
        console.log(`[Registo] Utilizador criado. isAdmin: ${newUser.isAdmin}`);

        res.status(201).json({
            success: true,
            message: 'Utilizador registado com sucesso!',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao registar utilizador.'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body; // 'identifier' pode ser username ou e-mail

        // Encontrar o utilizador com base no username ou e-mail
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas.'
            });
        }

        if (password != user.password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas.'
            });
        }

        // Geração do JWT (JSON Web Tokens)
        // O payload deve conter a informação mínima necessária para identificar o utilizador e autorização
        const payload = {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRATION
        });

        // Resposta de Sucesso
        res.status(200).json({
            success: true,
            message: 'Login bem-sucedido.',
            token, // Este token deverá ser guardado no frontend (localStorage)
            user: { username: user.username, isAdmin: user.isAdmin, nome: user.nome }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor durante o login.'
        });
    }
};