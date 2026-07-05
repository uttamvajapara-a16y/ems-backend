const express = require('express') ;
const { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile } = require('../controllers/employeeController');
const { userAuth, roleAuth } = require('../middleware/auth.middleware');
const { registerUser } = require('../controllers/authController');

const employeeRouter = express.Router() ;

employeeRouter.get("/employees" , userAuth , getEmployees) ;
employeeRouter.get("/employee/profile", userAuth, getProfile) ;
employeeRouter.get("/employees/:id", userAuth, getEmployeeById) ;
employeeRouter.post("/employee/register", roleAuth, registerUser) ;
employeeRouter.put("/employee/update/:id", roleAuth, updateEmployee) ;
employeeRouter.delete("/employee/delete/:id", roleAuth, deleteEmployee) ;

module.exports = employeeRouter ;