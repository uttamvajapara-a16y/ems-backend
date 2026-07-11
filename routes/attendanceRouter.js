const express = require('express') ;
const {employeeAuth, userAuth, roleAuth, adminAuth} = require('../middleware/auth.middleware') ;
const { checkIn, checkOut, getAttendance, getAttendanceReport } = require('../controllers/attendanceController');
const { auditLogDB } = require("../middleware/auditLogger.middleware") ;
 
const attendanceRouter = express.Router() ;

attendanceRouter.post("/attendance/checkin" , userAuth , auditLogDB("CHECK IN" , "Attendance"), checkIn) ;
attendanceRouter.post("/attendance/checkout" , userAuth , auditLogDB("CHECK OUT" , "Attendance"), checkOut) ;
attendanceRouter.get("/attendance/get" , userAuth , auditLogDB("GET" , "Attendance"), getAttendance) ;
attendanceRouter.get("/attendance/getReport" , roleAuth, auditLogDB("GET" , "Attendance"), getAttendanceReport) ;

module.exports = attendanceRouter ;