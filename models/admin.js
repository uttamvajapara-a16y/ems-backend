const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
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
    },
    profileImage: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        maxLength: 300,
        validate(value) {
            if (!validator.isURL(value)) throw new Error("invalid image url");
        }
    },
    stTime: {
        type: Date,
        default: new Date().setHours(10, 0, 0, 0)
    },
    endTime: {
        type: Date,
        default: new Date().setHours(22, 0, 0, 0)
    }
});

adminSchema.methods.validatePassword = async function (passwordByUser) {
    const user = this;
    const passwordhash = user.password;

    const isValidPassword = await bcrypt.compare(passwordByUser, passwordhash);
    return isValidPassword;
}

adminSchema.methods.getJWT = async function () {
    const user = this;

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '2d' });
    return token;
}

module.exports = mongoose.model("Admin", adminSchema);