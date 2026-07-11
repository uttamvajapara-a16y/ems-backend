const express = require('express') ;

const departmentRouter = express.Router() ;

const { createDepartment , getAllDepartments , getDepartmentById , updateDepartmentById , deleteDepartmentById } = require('../controllers/departmentController') ;
const { adminAuth, userAuth } = require('../middleware/auth.middleware');
const { auditLogDB } = require('../middleware/auditLogger.middleware');

departmentRouter.post('/department/create', adminAuth,auditLogDB("CREATE" , "Department"), createDepartment) ;
departmentRouter.get('/department/get/all', userAuth, auditLogDB("GET" , "Department"), getAllDepartments) ;
departmentRouter.get('/department/get/:id', userAuth, auditLogDB("GET" , "Department"), getDepartmentById) ;
departmentRouter.put('/department/update/:id', adminAuth,auditLogDB("UPDATE" , "Department"), updateDepartmentById) ;
departmentRouter.delete('/department/delete/:id', adminAuth,auditLogDB("DELETE" , "Department"), deleteDepartmentById) ;

module.exports = departmentRouter ; 