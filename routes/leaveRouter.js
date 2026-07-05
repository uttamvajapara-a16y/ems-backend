const mongoose = require('mongoose') ;
const express = require('express') ;

const { userAuth, roleAuth } = require('../middleware/auth.middleware') ;
const { applyLeave, reviewLeave, getLeaveDetails, getAllLeaveDetails } = require('../controllers/leaveController') ;
const { auditLogDB } = require('../middleware/auditLogger.middleware');

const leaveRouter = express.Router() ;

leaveRouter.post('/leave/apply' , userAuth ,auditLogDB("CREATE" , "Leave"), applyLeave) ;
leaveRouter.put('/leave/:status/:leaveId' , roleAuth , reviewLeave) ;
leaveRouter.get('/leave/my-leaves' , userAuth , getLeaveDetails) ;
leaveRouter.get('/leave/all-leaves' , roleAuth , getAllLeaveDetails) ;

module.exports = leaveRouter ;