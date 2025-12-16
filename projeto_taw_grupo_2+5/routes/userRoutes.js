const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas de Utilizadores
// Prefixo esperado no server.js: /api/users

// Obter perfil do próprio utilizador (Autenticado)
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);

// Obter todos os utilizadores (Apenas Admin)
router.get('/', authMiddleware.verifyToken, authMiddleware.checkAdmin, userController.getAllUsers);

// Eliminar um utilizador por ID (Apenas Admin)
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkAdmin, userController.deleteUser);

module.exports = router;
