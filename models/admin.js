const mongoose = require('mongoose');
const bcrypt = require('bcrypt') ;
const jwt = require('jsonwebtoken' );
const validator = require('validator');
require('dotenv').config() ;

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Admin"
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error("invalid email address");
        }
    },
    password: {
        type: String,
        required: true,
    }
});

adminSchema.methods.validatePassword = async function (passwordByUser) {
    const user = this ;
    const passwordhash = user.password ;

    const isValidPassword = await bcrypt.compare(passwordByUser , passwordhash) ;
    return isValidPassword ;
}

adminSchema.methods.getJWT = async function() {
    const user = this ;

    const token = await jwt.sign({_id: user._id} , process.env.JWT_SECRET_KEY , {expiresIn : '2d'}) ;
    return token ;
}

module.exports = mongoose.model("Admin", adminSchema);