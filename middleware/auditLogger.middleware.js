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
                        targetId: req.params.id,
                        changes: res.locals.changes,
                        userModel: actor.role,
                        departmentName: actor.departmentName
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