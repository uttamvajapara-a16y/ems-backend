const Leave = require('../models/leave');

const applyLeave = async (req, res, next) => {
    try {
        const user = req.user;
        const { startDate, endDate, leaveType, reason } = req.body;

        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        const today = new Date() ;
        today.setHours(0,0,0,0) ;

        if(newStart < today || newEnd < today){
            return res.status(400).json({
                success : false ,
                message : "dates cannot be in the past"
            })
        }

        const overlappingLeave = await Leave.findOne({
            applierId: user._id,
            status: { $in: ["pending", "approved"] }, 
            startDate: { $lte: newEnd },
            endDate: { $gte: newStart },
        }); 

        if (overlappingLeave) {
            return res.status(409).json({
                success: false,
                message: "You already have a leave request that overlaps with these dates",
            });
        }

        const leave = new Leave({
            startDate,
            endDate,
            leaveType,
            reason,
            applierId: user._id,
            applierModel: user.role,
            status: "pending",
            departmentId: user.departmentId,
            role: user.role
        })
        const savedLeave = await leave.save();
        await savedLeave.populate("applierId", "firstName lastName emailId role");
        res.status(201).json({ success: true, message: "leave request sent successfully", data: savedLeave });
    } catch (err) {
        next(err);
    }
}

const reviewLeave = async (req, res, next) => {
    try {
        const { status, leaveId } = req.params;
        const leave = await Leave.findById(leaveId);
        if (!leave)
            return res.status(404).json({ success: false, message: "leave not found" });
        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: "leave is already reviewed" });
        }

        if (status === "approved") {
            leave.status = "approved";
        } else {
            leave.status = "rejected";
            leave.rejectionReason = req.body.reason;
        }

        leave.reviewedAt = Date.now();
        leave.reviewerId = req.user._id;
        leave.reviewerModel = req.user.role;

        await leave.save();
        res.status(201).json({ success: true, message: `${status} successfully` });

    } catch (err) {
        next(err);
    }
}

const getLeaveDetails = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [leaves, totalCount] = await Promise.all([
            Leave.find({ applierId: req.user._id })
                .populate("applierId", "firstName lastName emailId role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Leave.countDocuments({ applierId: req.user._id }),
        ]);
        res.status(200).json({
            success: true,
            data: leaves,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: Number(page),
            },
        });
    } catch (err) {
        next(err);
    }
}

const getAllLeaveDetails = async (req, res, next) => {
    try {
        const { department, role, applierId, startDate, endDate, leaveType, status, reviewerId, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (department) filter.department = department;
        if (applierId) filter.applierId = applierId;
        if (startDate) filter.startDate = { ...filter.startDate, $gte: new Date(startDate) };
        if (endDate) filter.endDate = { ...filter.endDate, $lte: new Date(endDate) };
        if (leaveType) filter.leaveType = leaveType;
        if (status) filter.status = status;
        if (reviewerId) filter.reviewerId = reviewerId;
        if (role) filter.role = role;

        const skip = (Number(page) - 1) * Number(limit);

        const [leaves, totalCount] = await Promise.all([
            Leave.find(filter)
                .populate("applierId", "firstName lastName emailId role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Leave.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: leaves,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: Number(page),
            },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { applyLeave, reviewLeave, getLeaveDetails, getAllLeaveDetails };