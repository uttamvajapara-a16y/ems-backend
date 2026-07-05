const express = require('express') ;
const { roleAuth } = require('../middleware/auth.middleware');

const dashboardRouter = express.Router() ;

const { getStats } = require('../controllers/dashboardController');

dashboardRouter.get('/dashboard/stats' , roleAuth , getStats) ;

module.exports = dashboardRouter ;