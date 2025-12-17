const User = require('../models/Users'); // Importa o modelo Mongoose
const jwt = require('jsonwebtoken');     // Para criar tokens de sessão
const JWT_SECRET = 'a_vossa_chave_secreta_muito_segura';
const TOKEN_EXPIRATION = '1h';
const bcrypt = require('bcrypt');
//const DOMPurify = require('dompurify');

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
        //const clean = DOMPurify.sanitize('<b>hello there</b>');
        // Verificar se é o primeiro utilizador registado
        const userCount = await User.countDocuments({});
        const isFirstUser = userCount === 0;

        console.log(`[Registo] Contagem de utilizadores existentes: ${userCount}`);
        console.log(`[Registo] Is First User? ${isFirstUser}`);

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            username,
            email,
            password: hashedPassword, // Plain hash com bcrypt
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

        //        if (password != user.password) {
        //          return res.status(401).json({
        //            success: false,
        //          message: 'Credenciais inválidas.'
        //    });
        //  }
        // verficar password usando brcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log(`[Login] Verificando password para ${identifier}: ${isPasswordValid}`);
        console.log(`[Login] Password do utilizador: ${user.password}`);

        if (!isPasswordValid) {

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