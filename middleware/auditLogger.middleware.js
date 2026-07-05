const AuditLog = require('../models/auditLog')

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

module.exports = { auditLogDB } ;