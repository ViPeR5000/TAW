const rateLimit = require('express-rate-limit');


// 100 pedidos por ip a max  15 minutes api
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Upxxxx tenta novamente daqui a 15 minutos.'
    }
});

// 10 pedidos por ip ao registo/login
exports.authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'muitas tabtatuvas tenta novamente após 1 minuto.'
    }
});
