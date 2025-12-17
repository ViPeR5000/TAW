const jwt = require('jsonwebtoken');
const JWT_SECRET = 'a_vossa_chave_secreta_muito_segura'; // Deveria vir de variáveis de ambiente

// Middleware para verificar o token JWT
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'Nenhum token fornecido.'
        });
    }

    // O token vem no formato "Bearer <token>", então removemos o "Bearer "
    const tokenPart = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    jwt.verify(tokenPart, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Falha na autenticação do token.'
            });
        }

        // Se verificado com sucesso, guarda o ID do utilizador no request para uso 
        req.userId = decoded.id;
        req.user = decoded; // Guardar todo o payload se necessário (ex: isAdmin)
        next();
    });
};

// Middleware para verificar se é Admin
exports.checkAdmin = (req, res, next) => {
    // verifyToken deve ser executado antes deste para garantir que req.user existe
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Requer permissões de Administrador.'
        });
    }
};
