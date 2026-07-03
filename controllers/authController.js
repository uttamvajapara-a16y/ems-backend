const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcrypt") ;
const User = require('../models/user') ;

const registerUser = async (req , res , next) => {
    try{
        validateSignup(req) ;
        const {password , firstName , lastName , emailId} = req.body ;
        const passwordHash = await bcrypt.hash(password , 12) ;

        const user = new User({
            firstName , 
            lastName ,
            emailId ,
            password : passwordHash
        })

        const savedUser = await user.save() ;

        const token = await savedUser.getJWT() ;

        res.cookie("token" , token , {httpOnly : true , maxAge: 10*60*60*1000} ) ;

        res.json({message: "user added successfully" , data : savedUser}) ;
    } catch(err){
        next(err) ;
    }
}

const login = async (req , res , next) => {
    try{
        const {emailId , password} = req.body ;

        const user = await User.findOne({emailId}) ;
        if(!user) throw new Error("invalid credentials") ;

        const isPasswordValid = await user.validatePassword(password) ;

        if(isPasswordValid){
            const token = await user.getJWT() ;
            res.cookie("token", token, {httpOnly : true, maxAge: 10*60*60*1000}) ;
            res.send(user) ;
        } else 
            throw new Error("invalid credentials") ;
    } catch(err){
        next(err) ;
    }
}

const logout = async (req , res , next) => {
    res.cookie("token", null, {httpOnly : true, maxAge: 0})
    res.send("logout successfull")
}

module.exports = {registerUser , login , logout} ;