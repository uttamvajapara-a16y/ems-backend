const getUser = async (req , res , next) => {
    try{
        const user = req.user ;
        if(req.user.role !== "Admin") await user.populate("departmentId" , "departmentName")
        res.send(user) ;
    } catch (err) {
        next(err) ;
    }
}

module.exports = { getUser } ;