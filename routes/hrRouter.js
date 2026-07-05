const express = require('express');
const { adminAuth, hrAuth, userAuth, roleAuth } = require('../middleware/auth.middleware');
const { registerUser, login } = require('../controllers/authController');

const hrRouter = express.Router() ;

const { getHr, getHrById, updateHr, deleteHr, getProfile } = require('../controllers/hrController');

hrRouter.post('/hr/create' , adminAuth , registerUser) ;
hrRouter.get('/hr/profile', hrAuth, getProfile ) ;
hrRouter.get("/hr/getHr" ,roleAuth , getHr) ;
hrRouter.get("/hr/get/:id" , userAuth, getHrById) ;
hrRouter.put("/hr/update/:id", roleAuth, updateHr) ;
hrRouter.delete("/hr/delete/:id", adminAuth, deleteHr) ;

module.exports = hrRouter ;