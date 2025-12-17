const User = require('../models/Users');

// Obter perfil do próprio utilizador
exports.getProfile = async (req, res) => {
    try {
        // req.userId vem do middleware verifyToken
        const user = await User.findById(req.userId).select('-password'); // Excluir a password do resultado

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Erro ao obter perfil:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};

// Obter todos os utilizadores (apenas Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Erro ao listar utilizadores:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};

// Eliminar um utilizador (apenas Admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'Utilizador não encontrado.' });
        }

        res.status(200).json({
            success: true,
            message: 'Utilizador eliminado com sucesso.',
            id: deletedUser._id
        });
    } catch (error) {
        console.error("Erro ao eliminar utilizador:", error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};
