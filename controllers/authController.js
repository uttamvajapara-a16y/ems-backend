const Employee = require("../models/employee");
const HR = require("../models/hr");
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

            const token = await savedEmployee.getJWT();

            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });

            res.json({ message: "employee added successfully", data: savedEmployee });
        } else if(role === 'HR'){
            const hr = new HR({
                firstName,
                lastName,
                emailId,
                password: passwordHash,
                status: "active"
            })

            const savedHr = await hr.save();

            const token = await savedHr.getJWT();

            res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });

            res.json({ message: "HR added successfully", data: savedHr });
        }

        
    } catch (err) {
        next(err);
    }
}

const login = async (req, res, next) => {
    try {
        const { emailId, password, role } = req.body;

        if (role === "employee") {

            const employee = await Employee.findOne({ emailId });
            if (!employee) throw new Error("invalid credentials");

            const isPasswordValid = await employee.validatePassword(password);

            if (isPasswordValid) {
                const token = await employee.getJWT();
                res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
                res.send(employee);
            } else
                throw new Error("invalid credentials");
        } else if (role === "HR") {
            const hr = await HR.findOne({ emailId });
            if (!hr) throw new Error("invalid credentials");

            const isPasswordValid = await hr.validatePassword(password);

            if (isPasswordValid) {
                const token = await hr.getJWT();
                res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 60 * 1000 });
                res.send(hr);
            } else
                throw new Error("invalid credentials");
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