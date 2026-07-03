const AuditLog = require('../models/auditLog')
const rateLimit = require('express-rate-limit');

const auditLogDB = (action, targetType) => {
    return async (req, res, next) => {
        res.on("finish", async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await AuditLog.create({
                        userId: req.user._id,
                        action,
                        targetType,
                        targetId: req.params.id,
                        changes: res.locals.changes
                    })
                } catch (err) {
                    console.error("auditLog failed :: ", err.message);
                }
            }
        }) ;
        next() ;
    }
}

const errorHandler = (err , req , res , next) => {
    console.error(err.stack) ;
    const statusCode = err.statusCode || 500 ;
    const errMsg = err.message || "internal server error" ;

    res.status(statusCode).json({
        success : false ,
        error : errMsg
    })
}

const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true ,
    legacyHeaders: false ,
})

module.exports = { auditLogDB, errorHandler, authRateLimit } ;