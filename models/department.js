const mongoose = require('mongoose') ;

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String ,
        required: true ,
        unique: true ,
        trim: true,
        uppercase: true ,
        minLength: 3 ,
        maxLength: 20
    } ,
    description: {
        type: String ,
        required: true ,
        trim: true,
        minLength: 10 ,
        maxLength: 60
    } ,
    headName: {
        type: String ,
        required : true ,
        minLength: 3,
        maxLength: 25
    }
})

module.exports = mongoose.model("Department" , departmentSchema) ;