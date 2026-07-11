const express  = require("express") ;
const { registerUser, login, logout } = require("../controllers/authController");
const { authRateLimit } = require("../middleware/rateLimiter.middleware");
const {adminAuth} = require("../middleware/auth.middleware");
const { auditLogDB } = require("../middleware/auditLogger.middleware");

const authRouter = express.Router() ;

authRouter.post("/register", adminAuth, auditLogDB("CREATE" , "EMPLOYEE/HR"), registerUser) ;
// authRouter.post("/login" , authRateLimit , login) ;
authRouter.post("/login" , auditLogDB("LOGIN" , "EMPLOYEE/HR"), login) ;
authRouter.post("/logout",auditLogDB("LOG OUT" , "EMPLOYEE/HR"), logout) ;

module.exports = authRouter ; 