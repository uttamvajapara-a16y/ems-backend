const Employee = require("../models/employee");
const cloudinary = require("../config/cloudinary") ;

const getEmployees = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            department,
            status,
            search,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const filter = {};
        if (department) filter.department = department;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { emailId: { $regex: search, $options: "i" } },
                { designation: { $regex: search, $options: "i" } },
            ]
        }

        // pagination
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Number(limit), 100);
        const skip = (pageNum - 1) * limitNum;


        const [employees, totalCount] = await Promise.all([
            Employee.find(filter)
                .select("-password")
                .populate("departmentId", "name")
                .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limitNum),
            Employee.countDocuments(filter)
        ])
        if (employees.length === 0) return res.status(200).json({ message: "no employees found", employees: [] });
        res.status(200).json({
            success: true,
            message: "request successfull",
            employeesCount: employees.length,
            data: employees,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        })
    } catch (err) {
        next(err);
    }
}

const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findById(id).select("-password");
        if (!emp) return res.status(404).json({ success: "false", message: "employee not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: emp
        })
    } catch (err) {
        next(err);
    }
}

const updateEmployee = async (req , res , next) => {
    try{
        const allowedUpdates = ["firstName", "lastName", "emailId", "age", "gender", "profileImage", "departmentId", "managerId" , "designation" , "salary" , "status"] ;

        const isEditValid = Object.keys(req.body).every(field => allowedUpdates.includes(field)) ;

        let profileImage = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            profileImage = result.secure_url;
        }

        if(!isEditValid){
            throw new Error ("update not valid") ;
        } else {
            const {id} = req.params ;
            const emp = await Employee.findByIdAndUpdate(id , req.body , {runValidators: true , returnDocument: "after"}).select("-password") ;
            return res.status(200).json({
                success: true,
                message: "employee updated successfully",
                data: emp
            })
        }

    } catch (err){
        next(err) ;
    }
}

const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const emp = await Employee.findByIdAndDelete(id);
        if (!emp) return res.status(404).json({ success: "false", message: "employee not found" });
        res.status(200).json({
            success: true,
            message: "employee deleted successfully",
            data: emp
        })
    } catch (err) {
        next(err);
    }
}

const getProfile = async (req , res , next) => {
    try{
        const employee = req.employee ;
        if(!employee) return res.status(404).json({success: false , message: "employee not found"}) ;
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: employee
        })
    } catch (err) {
        next(err) ;
    }
}

module.exports = { getEmployees, getEmployeeById, deleteEmployee, updateEmployee, getProfile };