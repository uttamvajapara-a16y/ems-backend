const express = require('express')
const { roleAuth, userAuth, adminAuth } = require("../middleware/auth.middleware") ;
const { generatePayroll, generateBulkPayroll, markAsPaid, downloadPayslip, getAllPayrolls, getPayrollById, getMySlips, deletePayroll, generatePayrollHr, generateBulkPayrollHr } = require('../controllers/payrollController');
const { auditLogDB } = require('../middleware/auditLogger.middleware');

const payrollRouter = express.Router() ;

payrollRouter.post("/payroll/generate" , roleAuth , auditLogDB("CREATE" , "Payroll"), generatePayroll) ;
payrollRouter.post("/payroll/generate/hr" , adminAuth , auditLogDB("CREATE" , "Payroll"), generatePayrollHr) ;
payrollRouter.post("/payroll/generate-bulk", roleAuth, auditLogDB("CREATE" , "Payroll"), generateBulkPayroll) ;
payrollRouter.post("/payroll/generate-bulk/hr", adminAuth, auditLogDB("CREATE" , "Payroll"), generateBulkPayrollHr) ;
payrollRouter.get("/payroll/my-payslips" , userAuth , auditLogDB("GET" , "Payroll"), getMySlips) ;
payrollRouter.get("/payroll/download/:id", userAuth, auditLogDB("GET" , "Payroll"), downloadPayslip) ;
payrollRouter.get("/payroll", roleAuth, auditLogDB("GET" , "Payroll"), getAllPayrolls) ;
payrollRouter.get("/payroll/:id", roleAuth, auditLogDB("GET" , "Payroll"), getPayrollById) ;
payrollRouter.put("/payroll/mark-paid/:id" , auditLogDB("UPDATE" , "Payroll"), roleAuth, markAsPaid) ;
payrollRouter.delete("/payroll/:id", roleAuth, auditLogDB("DELETE" , "Payroll"), deletePayroll) ;

module.exports = payrollRouter ;