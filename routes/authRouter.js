const express  = require("express") ;
const { registerUser, login, logout } = require("../controllers/authController");
const { authRateLimit } = require("../middleware/rateLimiter.middleware");
const {adminAuth} = require("../middleware/auth.middleware")

const authRouter = express.Router() ;

authRouter.post("/register", adminAuth, registerUser) ;
// authRouter.post("/login" , authRateLimit , login) ;
authRouter.post("/login" , login) ;
authRouter.post("/logout", logout) ;

module.exports = authRouter ; 