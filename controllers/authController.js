const Employee = require("../models/employee");
const HR = require("../models/hr");
const Admin = require("../models/admin");
const { validateSignup } = require("../utils/validation");
const bcrypt = require("bcrypt");


const registerUser = async (req, res, next) => {
    try {
        validateSignup(req);
        const { password, firstName, lastName, emailId, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 12);

        if (role === "employee") {
            const employee = new Employee({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                status: "active"
            })

            const savedEmployee = await employee.save();

            if (req.user) return res.json({ message: "employee added successfully", data: savedEmployee });

            // const token = await savedEmployee.getJWT();
            // res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            // res.json({ message: "employee added successfully", data: savedEmployee });
        } else if (role === 'HR') {
            const hr = new HR({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                status: "active"
            })

            const savedHr = await hr.save();

            if (req.user) return res.json({ message: "HR added successfully", data: savedHr });

            // const token = await savedHr.getJWT();
            // res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            // res.json({ message: "HR added successfully", data: savedHr });
        } else if (role === "Admin") {
            const admin = new Admin({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
            })
            console.log(admin);
            const savedAdmin = await admin.save();

            res.status(201).json({
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

            if (isPasswordValid) {
                await employee.populate("departmentId", "departmentName");
                const token = await employee.getJWT();
                res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
                const employeeObj = employee.toObject();
                delete employeeObj.password;
                res.send(employeeObj);
            } else
                return res.status(400).json({ success: false, message: "invalid credentials" })
        } else if (role === "HR") {
            const hr = await HR.findOne({ emailId });
            if (!hr) return res.status(400).json({ success: false, message: "invalid credentials" })

            const isPasswordValid = await hr.validatePassword(password);

            if (isPasswordValid) {
                const token = await hr.getJWT();
                res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
                res.send(hr);
            } else
                return res.status(400).json({ success: false, message: "invalid credentials" })
        } else if (role === "Admin") {
            const admin = await Admin.findOne({ emailId });
            if (!admin) return res.status(400).json({ success: false, message: "invalid credentials" })

            const isPasswordValid = await admin.validatePassword(password);
            if (!isPasswordValid) return res.status(400).json({ success: false, message: "invalid credentials" })
            const token = await admin.getJWT();
            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
            res.send(admin);
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

module.exports = { login, logout, registerUser };