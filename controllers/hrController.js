const HR = require("../models/hr");
const Attendance = require("../models/attendance") ;

// const getHr = async (req, res, next) => {
//     try {
//         const { emailId, age, gender, departmentId, status, sortBy = "createdAt", sortOrder = "desc"} = req.query;

//         const filter = {};
//         if (emailId) filter.emailId = emailId;
//         if (age) filter.age = age;
//         if (gender) filter.gender = gender;
//         if (departmentId) filter.departmentId = departmentId;
//         if (status) filter.status = status;



//         const hrs = await HR.find(filter)
//             .select("-password")
//             .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 });

//         if (hrs.length === 0) return res.status(200).json({ message: "no hrs found", data: [] });

//         res.status(200).json({
//             success: true,
//             message: "request successfull",
//             data: hrs
//         })
//     } catch (err) {
//         next(err) ;
//     }
// }

const getHr = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            department,
            status,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
            attendance
        } = req.query;

        const filter = {};
        if (department) filter.departmentName = department;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { emailId: { $regex: search, $options: "i" } },
            ];
        }

        // if(req.user.role === "HR"){
        //     filter.department = {$in: [req.user.departmentName]} ;
        // }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- dynamic attendance filter ---
        if (attendance) {
            const todayRecords = await Attendance.find({ date: today }).select("employeeId status");

            if (attendance === "not-marked") {
                // employees with NO attendance record today
                const markedIds = todayRecords.map(r => r.employeeId);
                filter._id = { $nin: markedIds };
            } else {
                // employees whose today's status matches
                const matchedIds = todayRecords
                    .filter(r => r.status === attendance)
                    .map(r => r.employeeId);
                filter._id = { $in: matchedIds };
            }
        }

        // pagination
        const pageNum = Math.max(Number(page), 1);
        const limitNum = Math.min(Number(limit), 100);
        const skip = (pageNum - 1) * limitNum;

        const [hrs, totalCount] = await Promise.all([
            HR.find(filter)
                .select("-password")
                .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
                .skip(skip)
                .limit(limitNum),
            HR.countDocuments(filter)
        ]);  

        if (hrs.length === 0) {
            return res.status(200).json({ message: "no hrs found", hrs: [] });
        }

        // attach todayStatus to just this page's employees
        const records = await Attendance.find({ date: today }).select("employeeId status");
        const map = {};
        records.forEach((r) => { map[r.employeeId.toString()] = r.status; });

        const employeesWithStatus = hrs.map((emp) => {
            const empObj = emp.toObject();
            empObj.todayStatus = map[emp._id.toString()] || "not-marked";
            return empObj;
        });
        // console.log(employeesWithStatus) ;

        res.status(200).json({
            success: true,
            message: "request successfull",
            employeesCount: employeesWithStatus.length,
            data: employeesWithStatus,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (err) {
        next(err);
    }
};

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
        // console.log(req.body) ;
        const allowedUpdates = ["firstName", "lastName", "emailId", "age", "gender", "profileImage", "departmentId", "managerId" , 
            "designation" , "phone" , "Address" , "salary" , "status"];
        const isEditValid = req.user.role === "Admin" ? true :Object.keys(req.body).every(field => allowedUpdates.includes(field)) ; 

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