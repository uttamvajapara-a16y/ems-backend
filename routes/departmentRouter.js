const express = require('express') ;

const departmentRouter = express.Router() ;

const { createDepartment , getAllDepartments , getDepartmentById , updateDepartmentById , deleteDepartmentById } = require('../controllers/departmentController') ;
const { adminAuth, userAuth } = require('../middleware/auth.middleware');

departmentRouter.post('/department/create', adminAuth, createDepartment) ;
departmentRouter.get('/department/get/all', userAuth, getAllDepartments) ;
departmentRouter.get('/department/get/:id', userAuth, getDepartmentById) ;
departmentRouter.put('/department/update/:id', adminAuth, updateDepartmentById) ;
departmentRouter.delete('/department/delete/:id', adminAuth, deleteDepartmentById) ;

module.exports = departmentRouter ; 