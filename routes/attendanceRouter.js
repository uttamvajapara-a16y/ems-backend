const express = require('express') ;
const {employeeAuth, userAuth, roleAuth, adminAuth} = require('../middleware/auth.middleware') ;
const { checkIn, checkOut, getAttendance, getAttendanceReport } = require('../controllers/attendanceController');

const attendanceRouter = express.Router() ;

attendanceRouter.post("/attendance/checkin" , userAuth , checkIn) ;
attendanceRouter.post("/attendance/checkout" , userAuth , checkOut) ;
attendanceRouter.get("/attendance/get" , userAuth , getAttendance) ;
attendanceRouter.get("/attendance/getReport" , adminAuth , getAttendanceReport) ;

module.exports = attendanceRouter ;