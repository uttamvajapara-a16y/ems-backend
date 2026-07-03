const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true ,
    legacyHeaders: false ,
})

module.exports = { authRateLimit } ;