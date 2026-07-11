const Payroll = require('../models/payroll');
const Attendance = require("../models/attendance");
const Employee = require("../models/employee");
const HR = require("../models/hr");
const PDFDocument = require("pdfkit");
const {calculateDeductions} = require('../utils/deductionCounter') ;
const {validatePayrollMonth} = require('../utils/monthValidation') ;

const generatePayroll = async (req, res, next) => {
    try {
        const { employeeId, month, year, basicSalary, allowances = 0, departmentName } = req.body;

        const validDates = validatePayrollMonth(month, year) ;

        if(!validDates.valid){
            return res.status(400).json({
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
            employeeModel: "Employee",
            generatedBy: req.user._id,
            generatorModel: req.user.role,
            role: "Employee",
            departmentName
        });

        await (await payroll.populate("employeeId", "firstName lastName emailId designation")).populate("generatedBy" , "firstName lastName")

        res.status(201).json({ success: true, message: "Payroll generated", data: payroll });

    } catch (err) {
        next(err);
    }
}

const generatePayrollHr = async (req , res , next) => {
    try{
        const { hrId, month, year, basicSalary, allowances = 0, departmentName } = req.body;

        const validDates = validatePayrollMonth(month, year) ;

        if(!validDates.valid){
            return res.status(400).json({
                success: false, message: validDates.message 
            })
        }

        const existing = await Payroll.findOne({ hrId, month, year });
        if (existing) {
            return res.status(409).json({ success: false, message: "Payroll already generated for this month" });
        }

        const deductions = await calculateDeductions(hrId, month, year, basicSalary);

        const payroll = await Payroll.create({
            employeeId:hrId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            employeeModel: "HR",
            generatedBy: req.admin._id,
            generatorModel: "Admin",
            role: "HR",
            departmentName
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
            return res.status(400).json({
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
                employeeModel: emp.role ,
                generatorModel: req.user.role ,
                role: "Employee",
                departmentName: emp.departmentName
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
            return res.status(400).json({
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
                generatedBy: req.admin._id,
                employeeModel: hr.role ,
                generatorModel: "Admin",
                role : "HR",
                departmentName: hr.departmentName
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
        const { page = 1, limit = 10, month, year, status, role, dept } = req.query;
        const filter = {};

        if (month) filter.month = month;
        if (year) filter.year = year;
        if (status) filter.status = status;
        if (role) filter.role = role;
        if(dept) {
            filter.departmentName = dept ;
            filter.role = {$nin: ["HR"]}
        }

        const payrolls = await Payroll.find(filter)
            .populate("employeeId", "firstName lastName emailId designation")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Payroll.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);
        // console.log("payrolls are: ", payrolls);

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
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 50); // cap to prevent abuse
    const skip = (pageNum - 1) * limitNum;

    const [payrolls, totalCount] = await Promise.all([
      Payroll.find({ employeeId: user._id })
        .populate("employeeId", "firstName lastName emailId designation")
        .sort({ year: -1, month: -1 }) // most recent payslip first
        .skip(skip)
        .limit(limitNum),
      Payroll.countDocuments({ employeeId: user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: payrolls,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};

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