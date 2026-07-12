const Employee = require("../models/employee");
const cloudinary = require("../config/cloudinary");
const Attendance = require("../models/attendance");
const Leave = require("../models/leave")
const Payroll = require("../models/payroll");

// const getEmployees = async (req, res, next) => {
//     try {
//         const {
//             page = 1,
//             limit = 10,
//             department,
//             status,
//             search,
//             sortBy = "createdAt",
//             sortOrder = "desc",
//             attendance
//         } = req.query;

//         const filter = {};
//         if (department) filter.departmentName = department;
//         if (status) filter.status = status;
//         if (search) {
//             filter.$or = [
//                 { firstName: { $regex: search, $options: "i" } },
//                 { lastName: { $regex: search, $options: "i" } },
//                 { emailId: { $regex: search, $options: "i" } },
//                 { designation: { $regex: search, $options: "i" } },
//             ]
//         }

//         // pagination
//         const pageNum = Math.max(Number(page), 1);
//         const limitNum = Math.min(Number(limit), 100);
//         const skip = (pageNum - 1) * limitNum;


//         const [employees, totalCount] = await Promise.all([
//             Employee.find(filter)
//                 .select("-password")
//                 .populate("departmentId", "departmentName")
//                 .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
//                 .skip(skip)
//                 .limit(limitNum),
//             Employee.countDocuments(filter)
//         ])
//         if (employees.length === 0) return res.status(200).json({ message: "no employees found", employees: [] });


//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const records = await Attendance.find({ date: today }).select("employeeId status");

//         const map = {};
//         records.forEach((r) => {
//             map[r.employeeId.toString()] = r.status;
//         });

//         const employeesWithStatus = employees.map((emp) => {
//             const empObj = emp.toObject(); // convert Mongoose document to plain object so we can add a new field
//             empObj.todayStatus = map[emp._id.toString()] || "not-marked";
//             return empObj;
//         });

//         const presentEmployees = employeesWithStatus.filter(
//             emp => emp.todayStatus === attendance
//         );

//         console.log(presentEmployees);

//         res.status(200).json({
//             success: true,
//             message: "request successfull",
//             employeesCount: employees.length,
//             data: employeesWithStatus,
//             pagination: {
//                 totalCount,
//                 totalPages: Math.ceil(totalCount / limitNum),
//                 currentPage: pageNum,
//                 limit: limitNum
//             }
//         })
//     } catch (err) {
//         next(err);
//     }
// }

const getEmployees = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            department,
            status,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
            attendance
        } = req.query;

        const filter = {};
        if (department) filter.departmentName = department;
        if (status) filter.status = status;
        if (search) {
            const searchWords = search.trim().split(/\s+/);
            filter.$and = searchWords.map((word) => ({
                $or: [
                    { firstName: { $regex: word, $options: "i" } },
                    { lastName: { $regex: word, $options: "i" } },
                    { emailId: { $regex: word, $options: "i" } },
                    { designation: { $regex: word, $options: "i" } },
                ],
            }));
        }

        // if(req.user.role === "HR"){
        //     filter.department = {$in: [req.user.departmentName]} ;
        // }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- dynamic attendance filter ---
        if (attendance) {
            const todayRecords = await Attendance.find({ date: today }).select("employeeId status");

            if (attendance === "not-marked") {
                // employees with NO attendance record today
                const markedIds = todayRecords.map(r => r.employeeId);
                filter._id = { $nin: markedIds };
            } else {
                // employees whose today's status matches
                const matchedIds = todayRecords
                    .filter(r => r.status === attendance)
                    .map(r => r.employeeId);
                filter._id = { $in: matchedIds };
            }
        }

        // pagination
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Number(limit), 100);
        const skip = (pageNum - 1) * limitNum;

        const [employees, totalCount] = await Promise.all([
            Employee.find(filter)
                .select("-password")
                .populate("departmentId", "departmentName")
                .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limitNum),
            Employee.countDocuments(filter)
        ]);

        if (employees.length === 0) {
            return res.status(200).json({ message: "no employees found", employees: [] });
        }

        // attach todayStatus to just this page's employees
        const records = await Attendance.find({ date: today }).select("employeeId status");
        const map = {};
        records.forEach((r) => { map[r.employeeId.toString()] = r.status; });

        const employeesWithStatus = employees.map((emp) => {
            const empObj = emp.toObject();
            empObj.todayStatus = map[emp._id.toString()] || "not-marked";
            return empObj;
        });

        res.status(200).json({
            success: true,
            message: "request successfull",
            employeesCount: employeesWithStatus.length,
            data: employeesWithStatus,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (err) {
        next(err);
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findById(id).select("-password");
        if (!emp) return res.status(404).json({ success: "false", message: "employee not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: emp
        })
    } catch (err) {
        next(err);
    }
}

const updateEmployee = async (req, res, next) => {
    try {
        const allowedUpdates = ["firstName", "lastName", "emailId", "age", "phone", "gender", "profileImage", "departmentId", "managerId", "designation", "salary", "status", "Address"];

        const isEditValid = req.user.role === "Admin" ? true : Object.keys(req.body).every(field => allowedUpdates.includes(field));

        // console.log(req.file);

        if (!isEditValid) {
            return res.status(400).json({ success: false, message: "update not valid" })
        } else {
            if (req.file) {
                // const result = await new Promise((resolve, reject) => {
                //     cloudinary.uploader.upload_stream({ folder: "employee_profiles" }, (error, result) => {
                //         if (error) reject(error);
                //         else resolve(result);
                //     }).end(req.file.buffer);
                // });
                // req.body.profileImage = result.secure_url;

                const result = await cloudinary.uploader.upload(req.file.path);
                req.body.profileImage = result.secure_url;
            } else {
                delete req.body.profileImage;
            }
            const { id } = req.params;
            const emp = await Employee.findByIdAndUpdate(id, req.body, { runValidators: true, returnDocument: "after" }).select("-password");
            return res.status(200).json({
                success: true,
                message: "employee updated successfully",
                data: emp
            })
        }

    } catch (err) {
        next(err);
    }
}

const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findByIdAndDelete(id);
        if (!emp) return res.status(404).json({ success: "false", message: "employee not found" });
        res.status(200).json({
            success: true,
            message: "employee deleted successfully",
            data: emp
        })
    } catch (err) {
        next(err);
    }
}

const getProfile = async (req, res, next) => {
    try {
        const employee = req.employee;
        if (!employee) return res.status(404).json({ success: false, message: "employee not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: employee
        })
    } catch (err) {
        next(err);
    }
}

const getEmployeeStats = async (req, res, next) => {
    try {
        const employeeId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const [todayAttendance, monthlyAttendance, recentLeaves, latestPayslip] = await Promise.all([
            // today's attendance record, to check checked-in/checked-out status
            Attendance.findOne({ employeeId, date: today }),

            // this month's attendance records, to compute present/absent counts
            Attendance.find({
                employeeId,
                date: { $gte: startOfMonth, $lte: endOfMonth },
            }),

            // last 3 leave requests, most recent first
            Leave.find({ applierId: employeeId })
                .sort({ createdAt: -1 })
                .limit(3),

            // most recent payslip (by year, then month)
            Payroll.findOne({ employeeId })
                .sort({ year: -1, month: -1 }),
        ]);

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

module.exports = { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile, getEmployeeStats };