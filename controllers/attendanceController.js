const Attendance = require('../models/attendance');

const checkIn = async (req, res, next) => {
    try {
        const emp = req.employee;
        const { _id, departmentId } = emp;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({ employeeId: _id, date: today });
        if (existingAttendance) return res.status(400).json({ success: false, message: "you have already checked in today" });
        const attendance = new Attendance ({
            employeeId: _id,
            checkIn: new Date(),
            date: today,
            departmentId: departmentId
        })
        const savedAttendance = await attendance.save() ;
        res.status(201).send({ success: true, message: "check in successful", data: savedAttendance });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "You have already checked in today" });
        }
        next(error);
    }
}

const checkOut = async (req, res, next) => {
    try {
        const emp = req.employee;
        const { _id } = emp;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ employeeId: _id, date: today });
        if (!attendance) return res.status(400).json({ success: false, message: "please check in first" });
        if (attendance.checkOut) return res.status(400).json({ success: false, message: "you have already checked out today" });

        attendance.checkOut = new Date();
        await attendance.save();
        res.status(200).json({ success: true, message: "check out successful", data: attendance });
    } catch (error) {
        next(error);
    }
}

const getAttendance = async (req, res, next) => {
    try {
        const { empId } = req.params;
        const attendance = await Attendance.find({ employeeId: empId }).populate("employeeId", "firstName lastName emailId").populate("departmentId", "departmentName");
        if (!attendance.length) return res.status(404).json({ success: false, message: "no attendance record found" });
        res.status(200).json({ success: true, data: attendance });
    } catch (err) {
        next(err);
    }
}

const getAttendanceReport = async (req, res, next) => {
    try {
        const { department, month , year} = req.query;
        const filter = {} ;
        if(department) filter.departmentId = department ;
        if(month && year) {
            const startDate = new Date(year, month-1, 1) ;
            startDate.setHours(0, 0, 0, 0) ;
            const endDate = new Date(year, month, 0) ;
            endDate.setHours(23, 59, 59, 999) ;
            filter.date = {$gte : startDate , $lte : endDate}
        }

        const attendance = await Attendance.find(filter)
            .populate("employeeId", "firstName lastName emailId")
            .populate("departmentId", "departmentName")

        if(attendance.length === 0) return res.status(400).json({success: false , message: "no attendance record found"} )
        
        res.status(200).json({
            success: true, 
            message: "report generated" , 
            data: attendance
        })

    } catch (err) {
        next(err);
    }
}

module.exports = { checkIn, checkOut, getAttendance, getAttendanceReport };
























// const mongoose = require("mongoose");
// const Attendance = require("../models/attendance.model");

// const getAttendanceReport = async (req, res, next) => {
//   try {
//     const { month, year, department } = req.query;

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "month and year are required (e.g. ?month=7&year=2026)",
//       });
//     }

//     // build start and end date range for the given month
//     const startDate = new Date(year, month - 1, 1); // month is 1-indexed from client, JS Date is 0-indexed
//     startDate.setHours(0, 0, 0, 0);

//     const endDate = new Date(year, month, 0); // day 0 of next month = last day of this month
//     endDate.setHours(23, 59, 59, 999);

//     const matchStage = {
//       date: { $gte: startDate, $lte: endDate },
//     };

//     const pipeline = [
//       { $match: matchStage },

//       // join with User collection to get employee details (name, department)
//       {
//         $lookup: {
//           from: "users",
//           localField: "employeeId",
//           foreignField: "_id",
//           as: "employee",
//         },
//       },
//       { $unwind: "$employee" },

//       // optional department filter - applied AFTER lookup since department lives on User, not Attendance
//       ...(department
//         ? [
//             {
//               $match: {
//                 "employee.departmentId": new mongoose.Types.ObjectId(department),
//               },
//             },
//           ]
//         : []),

//       // group by employee, calculate summary stats
//       {
//         $group: {
//           _id: "$employeeId",
//           employeeName: { $first: "$employee.name" },
//           departmentId: { $first: "$employee.departmentId" },
//           totalDaysMarked: { $sum: 1 },
//           presentDays: {
//             $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
//           },
//           halfDays: {
//             $sum: { $cond: [{ $eq: ["$status", "half-day"] }, 1, 0] },
//           },
//           absentDays: {
//             $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
//           },
//           totalWorkingHours: { $sum: { $ifNull: ["$workingHours", 0] } },
//         },
//       },

//       // join department name for the response
//       {
//         $lookup: {
//           from: "departments",
//           localField: "departmentId",
//           foreignField: "_id",
//           as: "departmentInfo",
//         },
//       },
//       { $unwind: { path: "$departmentInfo", preserveNullAndEmptyArrays: true } },

//       // final shape of each row
//       {
//         $project: {
//           _id: 0,
//           employeeId: "$_id",
//           employeeName: 1,
//           department: "$departmentInfo.name",
//           totalDaysMarked: 1,
//           presentDays: 1,
//           halfDays: 1,
//           absentDays: 1,
//           totalWorkingHours: { $round: ["$totalWorkingHours", 2] },
//         },
//       },

//       { $sort: { department: 1, employeeName: 1 } },
//     ];

//     const report = await Attendance.aggregate(pipeline);

//     res.status(200).json({
//       success: true,
//       message: "Attendance report generated successfully",
//       month: Number(month),
//       year: Number(year),
//       totalEmployees: report.length,
//       data: report,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = { getAttendanceReport };