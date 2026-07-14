const express  = require("express") ;
const { registerUser, login, logout } = require("../controllers/authController");
const { authRateLimit } = require("../middleware/rateLimiter.middleware");
const { adminAuth, userAuth } = require("../middleware/auth.middleware");
const { auditLogDB } = require("../middleware/auditLogger.middleware");

const authRouter = express.Router() ;

authRouter.post("/register", adminAuth, auditLogDB("CREATE", "EMPLOYEE/HR"), registerUser) ;
authRouter.post("/login", auditLogDB("LOGIN", "USER"), login) ;
authRouter.post("/logout", userAuth, auditLogDB("LOGOUT", "USER"), logout) ;

module.exports = authRouter ;
