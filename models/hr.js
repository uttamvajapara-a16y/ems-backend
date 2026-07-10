const mongoose = require('mongoose') ;
const validator = require('validator') ;
const jwt = require('jsonwebtoken') ;
const bcrypt = require('bcrypt') ;
require('dotenv').config() ;

const hrSchema = new mongoose.Schema({
    firstName : {
        type: String ,
        required : true ,
        minLength: 3 ,
        maxLength: 15
    } ,
    lastName: {
        type: String ,
        required : true ,
        minLength: 3 ,
        maxLength: 15
    } ,
    emailId: {
        type: String ,
        required : true ,
        unique: true ,
        lowercase: true ,
        trim: true ,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("invalid email address") ;
        }
    } ,
    password: {
        type: String ,
        required: true ,
        minLength: 8 ,
        validate(value){
            if(!validator.isStrongPassword(value)) throw new Error("enter strong password") ;
        }
    } ,
    age: {
        type: Number ,
        min: 18 ,
        max: 50
    } ,
    gender: {
        type: String ,
        validate(value){
            if(!["male" , "female" , "other"].includes(value)) throw new Error("enter valid gender") ;
        }
    } ,
    role:{
        type: String ,
        default: "HR" 
    } ,
    profileImage: {
        type: String ,
        default: "https://geographyandyou.com/images/user-profile.png" ,
        maxLength: 300 ,
        validate(value){
            if(!validator.isURL(value)) throw new Error("invalid image url") ;
        }
    } ,
    departmentId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "Department"
    } , 
    departmentName: {
        type: String,
        required: true
    } ,
    managerId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "Manager"
    } ,
    dateOfJoining: {
        type: Date ,
        required: true
    } , 
    salary: {
        type: Number ,
        validate(value){
            if(value < 0) throw new Error("salary can not be negative") ;
            if(value > 1000000) throw new Error("salary can not exceed 1 million") ;
        }
    } , 
    status: {
        type: String ,
        validate(value){
            if(!["active", "inactive"].includes(value)) throw new Error("enter valid status") ;
        }
    }
}, {
    timestamps: true
})

hrSchema.methods.getJWT = async function() {
    const user = this ;

    const token = await jwt.sign({_id: user._id} , process.env.JWT_SECRET_KEY , {expiresIn : '2d'}) ;
    return token ;
}

hrSchema.methods.validatePassword = async function (passwordByUser) {
    const user = this ;
    const passwordhash = user.password ;

    const isValidPassword = await bcrypt.compare(passwordByUser , passwordhash) ;
    return isValidPassword ;
}

module.exports = mongoose.model("HR" , hrSchema) ;