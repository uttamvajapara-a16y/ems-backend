const AuditLog = require('../models/auditLog')

const auditLogDB = (action, targetType) => {
    return async (req, res, next) => {
        res.on("finish", async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const actor = req.user || req.admin;
                    if (!actor) return;
                    await AuditLog.create({
                        userId: actor._id,
                        action,
                        targetType,
                        changes: res.locals.changes,
                        userModel: actor.role,
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