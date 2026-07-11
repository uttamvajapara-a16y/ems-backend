const Admin = require("../models/admin");
const AuditLog = require("../models/auditLog")

const getAdmin = async (req, res, next) => {
    try {
        const admins = await Admin.find({});
        if (!admins) return res.status(404).send({ success: false, message: "no admin found" })
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: admins
        });
    } catch (err) {
        next(err);
    }
}

const getAdminById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).send({ success: false, message: "admin not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: admin
        });
    } catch (err) {
        next(err);
    }
}

const deleteAdmin = async (req, res, next) => {
    try {
        const id = req.params.id;
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) return res.status(404).json({ success: "false", message: "admin not found" });
        res.status(200).json({
            success: true,
            message: "admin deleted successfully",
            data: admin
        })
    } catch (err) {
        next(err);
    }
}

const getAuditLogs = async (req, res, next) => {
    try {
        const { date, action, targetType, userId, page = 1, limit = 10, } = req.query;
        const filter = {}
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
        if (action) filter.action = action;
        if (targetType) filter.targetType = targetType;
        if (userId) filter.userId = userId;

        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Number(limit), 100);
        const skip = (pageNum - 1) * limitNum;
 
        const [logs, logsCount] = await Promise.all([
            AuditLog.find(filter)
                .populate("userId", "firstName lastName emailId departmentName")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            AuditLog.countDocuments(filter)
        ])
        if (logs.length === 0) return res.status(200).json({ message: "no logs found", logs: [] });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: logs,
            pagination: {
                logsCount,
                totalPages: Math.ceil(logsCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        })
    } catch (err) {
        next(err);
    }
}

const getProfile = async (req, res, next) => {
    try {
        const admin = req.admin;
        if (!admin) return res.status(404).json({ success: false, message: "admin not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: admin
        })
    } catch (err) {
        next(err);
    }
}

module.exports = { getAdmin, getAdminById, getProfile, deleteAdmin, getAuditLogs };