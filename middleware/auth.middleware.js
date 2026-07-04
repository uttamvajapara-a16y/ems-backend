const jwt = require('jsonwebtoken');
const Employee = require('../models/employee');
const HR = require('../models/hr');
const admin = require('../models/admin');

const employeeAuth = async (req, res, next) => {
    try {
        const cookies = req.cookies;

        const { token } = cookies;
        if (!token) return res.status(401).send("please login")

        const decodeData = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { _id } = decodeData;

        const employee = await Employee.findById(_id);
        if (!employee) {
            throw new Error("User not found");
        }
        req.employee = employee;
        next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired, please login again" });
        }
        res.status(400).send("something went wrong :: " + err.message);
    }
}

const roleAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).send("please login");

        const { _id } = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await HR.findById(_id) || await admin.findById(_id);
        if (!user) throw new Error("access denied");

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError")
            return res.status(401).json({ message: "Session expired, please login again" });
        res.status(400).send("something went wrong :: " + err.message);
    }
}

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).send("please login");

        const { _id } = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await Employee.findById(_id) || await HR.findById(_id) || await admin.findById(_id);
        if (!user) throw new Error("User not found");

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError")
            return res.status(401).json({ message: "Session expired, please login again" });
        res.status(400).send("something went wrong :: " + err.message);
    }
}

module.exports = { employeeAuth, roleAuth, userAuth };