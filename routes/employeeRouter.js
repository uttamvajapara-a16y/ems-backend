const express = require('express') ;
const { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile, getEmployeeStats } = require('../controllers/employeeController');
const { userAuth, roleAuth, employeeAuth } = require('../middleware/auth.middleware');
// const upload = require('../middleware/upload.middleware');
const { registerUser } = require('../controllers/authController');
const multer = require("multer") ;
const upload = multer({dest: 'uploads/'}) ;

const employeeRouter = express.Router() ;

employeeRouter.get("/employees" , userAuth , getEmployees) ;
employeeRouter.get("/employee/profile", userAuth, getProfile) ;
employeeRouter.post("/employee/register", roleAuth, registerUser) ;
employeeRouter.get("/employee/dashboard/employee-stats", employeeAuth, getEmployeeStats) ;
employeeRouter.put("/employee/update/:id", userAuth, upload.single("profileImage"), updateEmployee) ;
employeeRouter.delete("/employee/delete/:id", roleAuth, deleteEmployee) ;
employeeRouter.get("/employees/:id", roleAuth, getEmployeeById) ;

module.exports = employeeRouter ;