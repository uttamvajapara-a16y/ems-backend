const Payroll = require('../models/payroll');
const Attendance = require("../models/attendance");
const Employee = require("../models/employee");
const HR = require("../models/hr");
const PDFDocument = require("pdfkit");

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

const validatePayrollMonth = (month, year) => {
  const requestedMonth = Number(month);
  const requestedYear = Number(year);

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JS months are 0-indexed, so add 1
  const currentYear = now.getFullYear();

  if (requestedYear > currentYear) {
    return { valid: false, message: "Cannot generate payroll for a future year" };
  }

  if (requestedYear === currentYear && requestedMonth >= currentMonth) {
    return { valid: false, message: "Cannot generate payroll for the current or a future month" };
  }

  return { valid: true };
};

const generatePayroll = async (req, res, next) => {
    try {
        const { employeeId, month, year, basicSalary, allowances = 0 } = req.body;

        const validDates = validatePayrollMonth(month, year) ;

        if(!validDates.valid){
            res.status(400).json({
                success: false, message: validDates.message 
            })
        }

        const existing = await Payroll.findOne({ employeeId, month, year });
        if (existing) {
            return res.status(409).json({ success: false, message: "Payroll already generated for this month" });
        }

        const deductions = await calculateDeductions(employeeId, month, year, basicSalary);

        const payroll = await Payroll.create({
            employeeId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            eployeeModel: "Employee",
            generatedBy: req.user._id,
            generatorModel: req.user.role,
        });

        res.status(201).json({ success: true, message: "Payroll generated", data: payroll });

    } catch (err) {
        next(err);
    }
}

const generatePayrollHr = async (req , res , next) => {
    try{
        const { hrId, month, year, basicSalary, allowances = 0 } = req.body;

        const validDates = validatePayrollMonth(month, year) ;

        if(!validDates.valid){
            res.status(400).json({
                success: false, message: validDates.message 
            })
        }

        const existing = await Payroll.findOne({ hrId, month, year });
        if (existing) {
            return res.status(409).json({ success: false, message: "Payroll already generated for this month" });
        }

        const deductions = await calculateDeductions(hrId, month, year, basicSalary);

        const payroll = await Payroll.create({
            hrId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            eployeeModel: "HR",
            generatedBy: req.user._id,
            generatorModel: "Admin",
        });

        res.status(201).json({ success: true, message: "Payroll generated", data: payroll });

    } catch(err){
        next(err) ;
    }
}

const generateBulkPayroll = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        
        const validDates = validatePayrollMonth(month, year) ;
        
        if(!validDates.valid){
            res.status(400).json({
                success: false, message: validDates.message 
            })
        }
        
        const employees = await Employee.find({ status: "active" });

        const results = [];
        for (const emp of employees) {
            const exists = await Payroll.findOne({ employeeId: emp._id, month, year });
            if (exists) continue;

            const deductions = await calculateDeductions(emp._id, month, year, emp.salary);

            const payroll = await Payroll.create({
                employeeId: emp._id,
                month,
                year,
                basicSalary: emp.salary,
                deductions,
                generatedBy: req.user._id,
                eployeeModel: emp.role ,
                generatorModel: req.user.role
            });
            results.push(payroll);
        }

        res.status(201).json({ success: true, message: `Payroll generated for ${results.length} employees`, data: results });

    } catch (err) {
        next(err);
    }
}

const generateBulkPayrollHr = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        
        const validDates = validatePayrollMonth(month, year) ;
        
        if(!validDates.valid){
            res.status(400).json({
                success: false, message: validDates.message 
            })
        }
        
        const hrs = await HR.find({ status: "active" });

        const results = [];
        for (const hr of hrs) {
            const exists = await Payroll.findOne({ hrId: hr._id, month, year });
            if (exists) continue;

            const deductions = await calculateDeductions(hr._id, month, year, hr.salary);

            const payroll = await Payroll.create({
                employeeId: hr._id,
                month,
                year,
                basicSalary: hr.salary,
                deductions,
                generatedBy: req.user._id,
                eployeeModel: hr.role ,
                generatorModel: "Admin"
            });
            results.push(payroll);
        }

        res.status(201).json({ success: true, message: `Payroll generated for ${results.length} employees`, data: results });

    } catch (err) {
        next(err);
    }
}

const markAsPaid = async (req, res, next) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });

        payroll.status = "paid";
        payroll.paymentDate = new Date();
        await payroll.save();

        res.status(200).json({ success: true, message: "Marked as paid", data: payroll });
    } catch (err) {
        next(err);
    }
};

const getAllPayrolls = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, month, year, status } = req.query;
        const filter = {};

        if (month) filter.month = month;
        if (year) filter.year = year;
        if (status) filter.status = status;

        const payrolls = await Payroll.find(filter)
            .populate("employeeId", "firstName lastName emailId designation")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Payroll.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: payrolls,
            pagination: {
                currentPage: page,
                totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (err) {
        next(err);
    }
};

const getPayrollById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findById(id).populate("employeeId", "firstName lastName emailId designation");
        if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });

        res.status(200).json({ success: true, data: payroll });
    } catch (err) {
        next(err);
    }
}

const getMySlips = async (req, res, next) => {
    try {
        const user = req.user;
        const payrolls = await Payroll.find({ employeeId: user._id }).populate("employeeId", "firstName lastName emailId designation");
        if(!payrolls) return res.status(404).json({ success: false, message: "No payslips found" });
        res.status(200).json({ success: true, data: payrolls });
    } catch (err) {
        next(err);
    }
}

const deletePayroll = async (req, res, next) => {
    try{
        const {id} = req.params ;
        const deletedPayroll = await Payroll.findByIdAndDelete(id) ;
        if(!deletedPayroll) return res.status(404).json({success: false, message: "Payroll not found"});
        res.status(200).json({success: true, message: "Payroll deleted", data: deletedPayroll});
    } catch(err){
        next(err);
    }
}

const downloadPayslip = async (req, res, next) => {
    try {
        const payroll = await Payroll.findById(req.params.id).populate("employeeId", "firstName lastName emailId designation");
        if (!payroll) return res.status(404).json({ success: false, message: "Payroll not found" });
        if(payroll.status !== "paid") return res.status(400).json({success: false, message: "Cannot download unpaid payslip"});

        const emp = payroll.employeeId;
        const doc = new PDFDocument({ margin: 50 });

        // stream the PDF directly to the response - no need to save it to disk first
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=payslip-${payroll.month}-${payroll.year}.pdf`);
        doc.pipe(res);

        // --- header ---
        doc.fontSize(20).text("Payslip", { align: "center" });
        doc.moveDown();
        doc.fontSize(10).text(`Month: ${payroll.month}/${payroll.year}`, { align: "center" });
        doc.moveDown(2);

        // --- employee details ---
        doc.fontSize(12).text(`Employee: ${emp.firstName} ${emp.lastName}`);
        doc.text(`Email: ${emp.emailId}`);
        doc.text(`Designation: ${emp.designation || "-"}`);
        doc.moveDown();

        // --- salary breakdown table (manual, since pdfkit has no built-in table) ---
        doc.fontSize(14).text("Salary Breakdown", { underline: true });
        doc.moveDown(0.5);

        const rows = [
            ["Basic Salary", payroll.basicSalary],
            ["Allowances", payroll.allowances],
            ["Deductions", -payroll.deductions],
            ["Net Salary", payroll.netSalary],
        ];

        rows.forEach(([label, value]) => {
            doc.fontSize(11).text(label, 70, doc.y, { continued: true });
            doc.text(`Rs. ${value}`, { align: "right" });
        });

        doc.moveDown(2);
        doc.fontSize(9).fillColor("gray").text(`Generated on ${new Date().toLocaleDateString()}`, { align: "center" });

        doc.end(); // finalize and flush the stream
    } catch (err) {
        next(err);
    }
};

module.exports = { generatePayroll, generateBulkPayroll, markAsPaid, downloadPayslip, getAllPayrolls, getPayrollById, getMySlips, deletePayroll, generatePayrollHr, generateBulkPayrollHr };