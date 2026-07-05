const Attendance = require("../models/attendance");

const calculateDeductions = async (empId, month, year, basicSalary) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const absentDays = await Attendance.countDocuments({
        employeeId: empId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
        status: "absent",
    });

    const perDaySalary = basicSalary / 30;
    return +(absentDays * perDaySalary).toFixed(2);
}

module.exports = { calculateDeductions };