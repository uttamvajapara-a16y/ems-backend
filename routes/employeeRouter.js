const express = require('express') ;
const { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile, getEmployeeStats } = require('../controllers/employeeController');
const { userAuth, roleAuth, employeeAuth } = require('../middleware/auth.middleware');
// const upload = require('../middleware/upload.middleware');
const { registerUser } = require('../controllers/authController');
const multer = require("multer") ;
const { auditLogDB } = require('../middleware/auditLogger.middleware');
const upload = multer({dest: 'uploads/'}) ;

const employeeRouter = express.Router() ;

employeeRouter.get("/employees" , userAuth , auditLogDB("GET" , "Employee"), getEmployees) ;
employeeRouter.get("/employee/profile", userAuth, getProfile) ;
employeeRouter.post("/employee/register", roleAuth, registerUser) ;
employeeRouter.get("/employee/dashboard/employee-stats", employeeAuth, getEmployeeStats) ;
employeeRouter.put("/employee/update/:id", userAuth, upload.single("profileImage"), auditLogDB("UPDATE" , "Employee"), updateEmployee) ;
employeeRouter.delete("/employee/delete/:id", roleAuth, auditLogDB("DELETE" , "Employee"), deleteEmployee) ;
employeeRouter.get("/employees/:id", roleAuth, auditLogDB("GET" , "Employee"), getEmployeeById) ;

module.exports = employeeRouter ; 