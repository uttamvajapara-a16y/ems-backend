const express = require('express') ;
const { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile, getEmployeeStats } = require('../controllers/employeeController');
const { userAuth, roleAuth, employeeAuth } = require('../middleware/auth.middleware');
const { registerUser } = require('../controllers/authController');

const employeeRouter = express.Router() ;

employeeRouter.get("/employees" , userAuth , getEmployees) ;
employeeRouter.get("/employee/profile", userAuth, getProfile) ;
employeeRouter.post("/employee/register", roleAuth, registerUser) ;
employeeRouter.get("/employee/dashboard/employee-stats", employeeAuth, getEmployeeStats) ;
employeeRouter.get("/employees/:id", roleAuth, getEmployeeById) ;
employeeRouter.put("/employee/update/:id", userAuth, updateEmployee) ;
employeeRouter.delete("/employee/delete/:id", roleAuth, deleteEmployee) ;

module.exports = employeeRouter ;