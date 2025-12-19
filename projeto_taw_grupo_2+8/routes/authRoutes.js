const express = require('express');
const router = express.Router();     // Cria uma nova instância de um objeto Router para agrupar rotas de forma lógica
const authController = require('../controllers/authController');   // Importa o authController que irá conter a lógica para o login, register, logout, etc.
const { registerValidation, loginValidation, validate } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/register', authLimiter, upload.single('fotografia'), registerValidation, validate, authController.register);     // Rota para o registo de novos utilizadores

router.post('/login', authLimiter, loginValidation, validate, authController.login); // Rota para o login de um utilizador

module.exports = router;