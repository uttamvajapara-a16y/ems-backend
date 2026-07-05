const express = require('express')
const { roleAuth, userAuth, adminAuth } = require("../middleware/auth.middleware") ;
const { generatePayroll, generateBulkPayroll, markAsPaid, downloadPayslip, getAllPayrolls, getPayrollById, getMySlips, deletePayroll, generatePayrollHr, generateBulkPayrollHr } = require('../controllers/payrollController');

const payrollRouter = express.Router() ;

payrollRouter.post("/payroll/generate" , roleAuth , generatePayroll) ;
payrollRouter.post("/payroll/generate/hr" , adminAuth , generatePayrollHr) ;
payrollRouter.post("/payroll/generate-bulk", roleAuth, generateBulkPayroll) ;
payrollRouter.post("/payroll/generate-bulk/hr", adminAuth, generateBulkPayrollHr) ;
payrollRouter.get("/payroll/my-payslips" , userAuth , getMySlips) ;
payrollRouter.get("/payroll/download/:id", userAuth, downloadPayslip) ;
payrollRouter.get("/payroll", roleAuth, getAllPayrolls) ;
payrollRouter.get("/payroll/:id", roleAuth, getPayrollById) ;
payrollRouter.put("/payroll/mark-paid/:id" , roleAuth, markAsPaid) ;
payrollRouter.delete("/payroll/:id", roleAuth, deletePayroll) ;

module.exports = payrollRouter ;