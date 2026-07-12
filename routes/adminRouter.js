const express = require('express') ;
const { adminAuth, userAuth } = require("../middleware/auth.middleware") ;
const { registerUser } = require('../controllers/authController');

const { getProfile, getAdmin, getAdminById, deleteAdmin, getAuditLogs } = require('../controllers/adminController');
const adminRouter = express.Router() ;

adminRouter.post("/admin/registerAdmin" , adminAuth , registerUser) ;
adminRouter.get("/admin/getProfile", adminAuth, getProfile) ;
adminRouter.get("/admin" , userAuth , getAdmin) ;
adminRouter.get("/admin/getAdmin/:id" , userAuth , getAdminById) ;
adminRouter.delete("/admin/deleteAdmin/:id", adminAuth, deleteAdmin) ;  
adminRouter.get("/admin/auditLog" , adminAuth , getAuditLogs) ;


module.exports = adminRouter ;