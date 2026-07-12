const Employee = require("../models/employee");
const Attendance = require("../models/attendance");
const HR = require('../models/hr');
const Leave = require("../models/leave");
const Department = require("../models/department");
const Payroll = require("../models/payroll");

const getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const filter = req.user.role === "HR" ? ({
            departmentName: req.user.departmentName,
            role : { $ne: "HR" }
        }) : "" ;

        const [
            totalEmployees,
            totalHR,
            departmentWiseCount,
            todayAttendance,
            pendingLeaves,
            monthlyAttendanceTrend,
            recentLeaveRequests,
        ] = await Promise.all([
            Employee.countDocuments({ status: "active" }),
            HR.countDocuments({ status: "active" }),

            Employee.aggregate([
                { $match: { status: "active" } },
                {
                    $lookup: {
                        from: 'departments',
                        localField: "departmentName",
                        foreignField: "departmentName",
                        as: "department"
                    }
                },
                { $unwind: "$department" },
                {
                    $group: {
                        _id: "$department._id",
                        departmentName: { $first: "$department.departmentName" },
                        employeeCount: { $sum: 1 }
                    }
                },
                { $sort: { employeeCount: -1 } }
            ]),

            Attendance.aggregate([
                { $match: { date: today } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),

            Leave.countDocuments({ status: "pending", ...filter }),

            Attendance.aggregate([
                { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
                {
                    $group: {
                        _id: { date: "$date", status: "$status" },
                        count: { $sum: 1 },
                    },
                },
                {
                    $group: {
                        _id: "$_id.date",
                        statuses: {
                            $push: { status: "$_id.status", count: "$count" },
                        },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            Leave.find({ status: "pending"})
                .sort({ createdAt: -1 })
                .limit(3)
                .populate("applierId", "firstName lastName role profileImage"),
        ])

        const attendanceToday = { present: 0, absent: 0, "half-day": 0, leave: 0 };
        todayAttendance.forEach((item) => {
            attendanceToday[item._id] = item.count;
        });


        res.status(200).json({
            success: true,
            data: {
                headcount: {
                    totalEmployees,
                    totalHR,
                    totalWorkforce: totalEmployees + totalHR,
                },
                departmentWiseCount,
                attendanceToday,
                pendingLeaves,
                monthlyAttendanceTrend,
                recentLeaveRequests,
            },
        });
    } catch (error) {
        next(err);
    }
};

const myAttendance = async (req, res, next) => {
    try {
        const { _id, role } = req.user;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const [todayAttendance, monthlyAttendance, recentLeaves] = await Promise.all([
            // today's attendance record, to check checked-in/checked-out status
            Attendance.findOne({ employeeId: _id , date: today }),

            // this month's attendance records, to compute present/absent counts
            Attendance.find({
                employeeId: _id,
                date: { $gte: startOfMonth, $lte: endOfMonth },
            }),

            // last 3 leave requests, most recent first
            Leave.find({ applierId: _id })
                .sort({ createdAt: -1 })
                .limit(3),
        ]);

        let latestPayslip;

        if (role === "HR")
            latestPayslip = await Payroll.findOne({ employeeId: _id }).sort({ year: -1, month: -1 });

        const presentDays = monthlyAttendance.filter((a) => a.status === "present").length;
        const absentDays = monthlyAttendance.filter((a) => a.status === "absent").length;
        const halfDays = monthlyAttendance.filter((a) => a.status === "half-day").length;

        res.status(200).json({
            success: true,
            data: {
                checkedInToday: !!todayAttendance?.checkIn,
                checkedOutToday: !!todayAttendance?.checkOut,
                monthlyAttendance: {
                    presentDays,
                    absentDays,
                    halfDays,
                    totalMarked: monthlyAttendance.length,
                },
                recentLeaves,
                latestPayslip,
            },
        });
    } catch (err) {
        next(err);
    }
}
 
module.exports = { getStats, myAttendance };