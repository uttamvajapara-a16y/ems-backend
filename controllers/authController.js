const Employee = require("../models/employee");
const HR = require("../models/hr");
const Admin = require("../models/admin");
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcrypt");


const registerUser = async (req, res, next) => {
    try {
        // validateSignup(req);
        const { password, firstName, lastName, emailId, role, departmentName, departmentId, designation, dateOfJoining, salary } = req.body;
        const passwordHash = await bcrypt.hash(password, 12);

        if (role === "Employee") {
            const employee = new Employee({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                status: "active",
                departmentName,
                departmentId,
                designation,
                dateOfJoining,
                salary
            })

            const savedEmployee = await employee.save();

            return res.status(201).json({ success: true, message: "employee added successfully", data: savedEmployee });

        } else if (role === 'HR') {
            const hr = new HR({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                status: "active",
                departmentName,
                departmentId,
                dateOfJoining,
                salary
            })

            const savedHr = await hr.save();

            return res.status(201).json({ success: true, message: "HR added successfully", data: savedHr });
        } else if (role === "Admin") {
            const admin = new Admin({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
            })
            const savedAdmin = await admin.save();

            return res.status(201).json({
                success: true,
                message: "Admin added successfully",
                data: savedAdmin
            })
        } else {
            return res.status(400).json({ error: "please provide valid role" })
        }


    } catch (err) {
        next(err);
    }
}

const login = async (req, res, next) => {
    try {
        const { emailId, password, role } = req.body;

        if (role === "Employee") {

            const employee = await Employee.findOne({ emailId });
            if (!employee) return res.status(400).json({ success: false, message: "invalid credentials" })

            const isPasswordValid = await employee.validatePassword(password);

            if (!isPasswordValid) return res.status(400).json({ success: false, message: "invalid credentials" })

            await employee.populate("departmentId", "departmentName");
            const token = await employee.getJWT();
            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            req.user = employee;
            const employeeObj = employee.toObject();
            delete employeeObj.password;
            return res.send(employeeObj);

        } else if (role === "HR") {
            const hr = await HR.findOne({ emailId });
            if (!hr) return res.status(400).json({ success: false, message: "invalid credentials" })

            const isPasswordValid = await hr.validatePassword(password);
            if (!isPasswordValid) return res.status(400).json({ success: false, message: "invalid credentials" })

            const token = await hr.getJWT();
            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            req.user = hr;
            return res.send(hr);

        } else if (role === "Admin") {
            const admin = await Admin.findOne({ emailId });
            if (!admin) return res.status(400).json({ success: false, message: "invalid credentials" })

            const isPasswordValid = await admin.validatePassword(password);
            if (!isPasswordValid) return res.status(400).json({ success: false, message: "invalid credentials" })

            const token = await admin.getJWT();
            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            req.user = admin;
            return res.send(admin);
        } else {
            return res.status(400).json({ message: "please provide valid role" })
        }
    } catch (err) {
        next(err);
    }
}

const logout = async (req, res, next) => {
    res.cookie("token", null, { httpOnly: true, maxAge: 0 })
    res.send("logout successfull")
}

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword, role } = req.body;
        let user;

        if (role === "Employee") {
            user = await Employee.findById(req.user._id);
        } else if (role === "HR") {
            user = await HR.findById(req.user._id);
        } else if (role === "Admin") {
            user = await Admin.findById(req.user._id);
        }

        if (!user) return res.status(404).json({ success: false, message: "user not found" });

        const isOldPasswordValid = await user.validatePassword(oldPassword);

        if (!isOldPasswordValid) return res.status(400).json({ success: false, message: "incorrect old password" });

        const newPasswordHash = await bcrypt.hash(newPassword, 12);
        user.password = newPasswordHash;
        await user.save();

        res.status(200).json({ success: true, message: "password changed successfully" });
    } catch (err) {
        next(err);
    }
}

module.exports = { login, logout, registerUser, changePassword };