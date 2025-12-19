const { body, validationResult } = require('express-validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitization helper
const sanitize = (value) => {
    return DOMPurify.sanitize(value);
};

exports.registerValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username é obrigatório')
        .isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres')
        .customSanitizer(sanitize),
    body('email')
        .trim()
        .notEmpty().withMessage('Email é obrigatório')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .exists() // Checks if field exists
        .isLength({ min: 6 }).withMessage('Password deve ter pelo menos 6 caracteres'),
    body('nome')
        .trim()
        .notEmpty().withMessage('Nome é obrigatório')
        .customSanitizer(sanitize),
    body('nif')
        .optional()
        .trim()
        .customSanitizer(sanitize),
    body('morada')
        .optional()
        .trim()
        .customSanitizer(sanitize),
    body('telemovel')
        .optional()
        .trim()
        .customSanitizer(sanitize)
];

exports.loginValidation = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('Username ou Email é obrigatório')
        .customSanitizer(sanitize),
    body('password')
        .notEmpty().withMessage('Password é obrigatória')
];

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: `Erro no campo: ${errorSummary}`,
            errors: errors.array()
        });
    }
    next();
};
