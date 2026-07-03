const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        const { token } = cookies;
        if (!token) return res.status(401).send("please login")

        const decodeData = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { _id } = decodeData;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired, please login again" });
        }
        res.status(400).send("something went wrong :: " + err.message);
    }
}

const roleAuth = async (...allowedRoles) => {
    return (req, res, next) => {
        if (req.user && allowedRoles.includes(req.user.role)) {
            return next();
        } else {
            res.status(403).send("access denied");
        }
    }
}

module.exports = { userAuth, roleAuth };