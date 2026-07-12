const Employee = require("../models/employee") ;
const HR = require("../models/hr") ;
const Admin = require("../models/admin") ;
const Chat = require("../models/chat") ;

const roleModelMap = {
  employee: "Employee",
  hr: "HR",
  manager: "Manager",
  admin: "Admin",
};

const getContacts = async (req, res, next) => {
    try{
        const currentUserId = req.user._id.toString() ;

        // fetch all users 
        const [employees, hrs, admins] = await Promise.all([
            Employee.find({status: "active"})
                .select("_id firstName lastName emailId departmentName profileImage role"),
            
            HR.find({status: "active"})
                .select("_id firstName lastName emailId departmentName profileImage role"),
            
            Admin.find()
                .select("_id firstName lastName emailId profileImage role"),
        ]) ;

        // combine everyone into one flat list, excluding the current logged-in user
        const allContacts = [...employees, ...hrs, ...admins].filter((c) => c._id.toString() !== currentUserId) ;
        // console.log("All contacts: ", allContacts);

        // group by department name
        const grouped = {} ;
        allContacts.forEach((contact) => {
            const deptName = contact.departmentName || "No Department" ;
            if(!grouped[deptName]) grouped[deptName] = [] ;
            grouped[deptName].push(contact) ;
        })

        // console.log("group",grouped) ;

        res.status(200).json({
            success: true,
            count: allContacts.length,
            data: grouped,
        })
    } catch (err) {
        next(err) ;
    }
}

const getConversation = async (req, res, next) => {
    try{
        const currentUserId = req.user._id ;
        const { userId } = req.params ;

        const chats = await Chat.find({
            $or: [
                {senderId: currentUserId , receiverId: userId},
                {senderId: userId , receiverId: currentUserId}
            ]
        }).sort({createdAt: 1}) ;

        await Chat.updateMany(
            {senderId: userId, receiverId: currentUserId, read: false },
            {$set: {read: true}}
        ) ;

        res.status(200).json({
            success: true,
            data: chats,
        })
    } catch (err) {
        next(err) ;
    }
}

const getUnreadCount = async (req, res, next) => {
    try{
        const count = await Chat.countDocuments({
            receiverId: req.user._id ,
            read: false
        }) ;
        res.status(200).json({
            success: true,
            count,
        }) ;
    } catch (err) { 
        next(err) ;
    }
}

const sendMessage = async (req, res, next) => {
    try {
        const { receiverId , receiverModel , text } = req.body ;

        if(!text || !text.trim()) return res.status(400).json({success: false, message: "Message can not be empty"}) ;

        const chat = await Chat.create({
            senderId: req.user._id,
            senderModel: req.user.role,
            receiverId,
            receiverModel,
            text: text.trim(),
        }) ;

        res.status(200).json({
            success: true,
            data: chat,
        })
    } catch (err) {
        next(err) ;
    }
}

module.exports = { getContacts, getConversation, getUnreadCount, sendMessage } ;