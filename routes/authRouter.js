const express  = require("express") ;
const { registerUser, login, logout } = require("../controllers/authController");

const authRouter = express.Router() ;

authRouter.post("/register" , registerUser) ;
authRouter.post("/login" , login) ;
authRouter.post("/logout", logout) ;

module.exports = authRouter ;