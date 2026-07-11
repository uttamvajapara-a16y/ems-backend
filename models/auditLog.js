const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refpath: "userMode",
        required: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ["Employee", "Manager", "HR", "Admin"],
    },
    action: {
        type: String,
        required: true,
        enum: ["CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "CALCLE", "LOGIN", "LOGOUT" , "CHECK IN", "CHECK OUT", "GET"]
    },
    targetType: {
        type: String,
        required: true,
        enum: ["Employee", "Department", "Attendance", "Leave", "Payroll", "Admin", "HR", "EMPLOYEE/HR"]
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    changes: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
})

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);





// const logAction = (action, targetType) => {
//   return async (req, res, next) => {
//     res.on("finish", async () => {
//       if (res.statusCode < 400) {
//         await AuditLog.create({
//           userId: req.user._id,
//           action,
//           targetType,
//           targetId: req.params.id || res.locals.newId,
//           changes: res.locals.changes || {},
//           ipAddress: req.ip,
//           userAgent: req.headers["user-agent"],
//         });
//       }
//     });
//     next();
//   };
// };

// // usage in routes
// router.put("/:id", authMiddleware, roleMiddleware(["admin","hr"]), logAction("UPDATE", "Employee"), updateEmployee);