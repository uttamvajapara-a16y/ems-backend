const Leave = require('../models/leave');

const applyLeave = async (req, res, next) => {
    try {
        const user = req.user;
        const { startDate, endDate, leaveType, reason } = req.body;

        if(reason.length < 10) return res.status(400).json({
            success : false ,
            message : "reason must be 10 characters long"
        })
        if(reason.length > 100) return res.status(400).json({
            success: false ,
            message : "reason cannot exceed 100 characters"
        })

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

const cancleLeave = async (req, res, next) => {
    try {
        const { id } = req.body ;
        const leaveReq = await Leave.findById(id) ;
        if(!leaveReq) return res.status(404).json({success: false, message: "leave request not found"}) ;
        if(!leaveReq.applierId.equals(req.user._id)) return res.status(403).json({success: false, message: "access denied"}) ;
        await Leave.findByIdAndDelete(id) ;
        res.status(200).json({success: true, message: "leave cancelled successfully"}) 
    } catch (err) {
        next(err) ;
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
        const { page = 1, limit = 10, month, year } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const now = new Date() ;
        const targetMonth = month ? Number(month) : now.getMonth() + 1 ;
        const targetYear = year ? Number(year) : now.getFullYear() ;

        const startDate = new Date(targetYear, targetMonth - 1, 1) ;
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59) ;

        const records = await Leave.find({
            applierId: req.user._id,
            startDate: { $gte: startDate, $lte: endDate }
        }).sort({startDate: 1}).skip(skip).limit(Number(limit)) ;

        const summary = {
            approvedLeaves: records.filter((r) => r.status === "approved").length ,
            rejectedLeaves: records.filter((r) => r.status === "rejected").length ,
            pendingLeaves: records.filter((r) => r.status === "pending").length ,
            totalLeaves: records.length
        }

        totalCount = await Leave.countDocuments({ applierId: req.user._id }) ;
        
        res.status(200).json({
            success: true,
            month: targetMonth,
            year: targetYear,
            data: records,
            summary,
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

module.exports = { applyLeave, reviewLeave, getLeaveDetails, getAllLeaveDetails, cancleLeave };