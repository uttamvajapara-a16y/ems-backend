const Employee = require("../models/employee");
const Attendance = require("../models/attendance");
const HR = require('../models/hr');
const Leave = require("../models/leave");
const Department = require("../models/department");

const getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

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
                        localField: "departmentId",
                        foreignField: "_id",
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

            Leave.countDocuments({ status: "pending" }),

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

            Leave.find({ status: "pending" })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("applierId", "firstName lastName role"),
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

module.exports = { getStats };