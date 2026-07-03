const mongoose = require('mongoose') ,

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true,
        uppercase: true ,
        minLength: 3 ,
        maxLength: 10
    } ,
    description: {
        type: String ,
        required: true ,
        trim: true,
        minLength: 10 ,
        maxLength: 60
    } ,
    headId: {
        type: mongoose.Schema.Types.ObjectId ,
        required : true ,
        ref: "User"
    }
})

module.exports = mongoose.model("Department" , departmentSchema) ;