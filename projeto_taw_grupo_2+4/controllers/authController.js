const User = require('../models/User'); // Importa o modelo Mongoose
const jwt = require('jsonwebtoken');     // Para criar tokens de sessão
const JWT_SECRET = 'a_vossa_chave_secreta_muito_segura'; 
const TOKEN_EXPIRATION = '1h';