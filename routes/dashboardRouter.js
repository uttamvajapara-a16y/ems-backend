const express = require('express') ;
const { roleAuth } = require('../middleware/auth.middleware');

const dashboardRouter = express.Router() ;

const { getStats, myAttendance } = require('../controllers/dashboardController');

dashboardRouter.get('/dashboard/stats' , roleAuth , getStats) ;
dashboardRouter.get('/dashboard/my-attendance', roleAuth, myAttendance) ;

module.exports = dashboardRouter ;