const HR = require("../models/hr");

const getHr = async (req, res, next) => {
    try {
        const { emailId, age, gender, departmentId, status, sortBy = "createdAt", sortOrder = "desc"} = req.query;

        const filter = {};
        if (emailId) filter.emailId = emailId;
        if (age) filter.age = age;
        if (gender) filter.gender = gender;
        if (departmentId) filter.departmentId = departmentId;
        if (status) filter.status = status;

        const hrs = await HR.find(filter)
            .select("-password")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });

        if (hrs.length === 0) return res.status(200).json({ message: "no hrs found", data: [] });

        res.status(200).json({
            success: true,
            message: "request successfull",
            data: hrs
        })
    } catch (err) {
        next(err) ;
    }
}

const getHrById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const hr = await HR.findById(id).select("-password").populate("departmentId", "departmentName");
        if (!hr) return res.status(404).json({ success: "false", message: "hr not found" });
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: hr
        })
    } catch (err) {
        next(err) ;
    }
}

const updateHr = async (req , res , next) => {
    try{
        console.log(req.body) ;
        const allowedUpdates = ["firstName", "lastName", "emailId", "age", "gender", "profileImage", "departmentId", "managerId" , 
            "designation" , "phone" , "Address" , "salary" , "status"];
        const isEditValid = Object.keys(req.body).every(field => allowedUpdates.includes(field)) ; 

        if(!isEditValid){
            return res.status(400).json({success: false, message: "update not valid"}) ;
        } else {
            const {id} = req.params ;
            const hr = await HR.findByIdAndUpdate(id , req.body , {new: true , runValidators: true, returnDocument: "after"}).select("-password") ;
            return res.status(200).json({
                success: true,
                message: "hr updated successfully",
                data: hr
            })
        }
    } catch (err){
        next(err) ;
    }
} 

const deleteHr = async (req , res , next) => {
    try{
        const { id } = req.params;
        const hr = await HR.findByIdAndDelete(id) ;
        if(!hr) return res.status(404).json({success: false , message: "hr not found"}) ;
        res.status(200).json({
            success: true,
            message: "hr deleted successfully",
            data: hr
        })
    } catch (err) {
        next(err) ;
    }
}

const getProfile = async (req , res , next) => {
    try{
        const hr = req.hr ;
        if(!hr) return res.status(404).json({success: false , message: "hr not found"}) ;
        res.status(200).json({
            success: true,
            message: "request successfull",
            data: hr
        })
    } catch (err) {
        next(err) ;
    }
}

module.exports = { getHr, getHrById, updateHr, deleteHr, getProfile };