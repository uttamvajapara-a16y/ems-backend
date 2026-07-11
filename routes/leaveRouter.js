const mongoose = require('mongoose') ;
const express = require('express') ; 

const { userAuth, roleAuth } = require('../middleware/auth.middleware') ;
const { applyLeave, reviewLeave, getLeaveDetails, getAllLeaveDetails, cancleLeave } = require('../controllers/leaveController') ;
const { auditLogDB } = require('../middleware/auditLogger.middleware');

const leaveRouter = express.Router() ;

leaveRouter.post('/leave/apply' , userAuth , auditLogDB("CREATE" , "Leave"), applyLeave) ;
leaveRouter.post('/leave/cancle' , userAuth , auditLogDB("CANCLE" , "Leave"), cancleLeave) ;
leaveRouter.put('/leave/review/:status/:leaveId' , roleAuth , reviewLeave) ;
leaveRouter.get('/leave/my-leaves' , userAuth , auditLogDB("GET" , "Leave"), getLeaveDetails) ;
leaveRouter.get('/leave/all-leaves' , roleAuth , auditLogDB("CREAGETTE" , "Leave"), getAllLeaveDetails) ;

module.exports = leaveRouter ;