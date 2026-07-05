const mongoose = require('mongoose') ;

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId ,
        refPath: "employeeModel" ,
        required: true
    } ,
    employeeModel: {
        type: String ,
        enum: ["HR", "Employee", "Admin", "Manager"] ,
        required: true
    } ,
    month: {
      type: Number, // 1-12
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
        type: Number ,
        required: true ,
        min: 0
    } ,
    allowances: {
      type: Number,
      default: 0,
      min: 0, 
    },
    deductions: {
        type: Number ,
        default: 0 ,
        min: 0
    } ,
    netSalary: {
        type: Number ,
        min: 0
    } ,
    paymentDate: {
        type: Date 
    } ,
    status: {
        type: String ,
        enum: ["pending", "paid" , "processing" , "failed"] ,
        default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cash", "cheque"],
      default: "bank_transfer",
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "generatorModel",
    },
    generatorModel: {
        type: String ,
        enum: ["HR", "Admin"] ,
        required: true
    }
} , {
    timestamps: true
})

payrollSchema.index({employeeId: 1 , month: 1 , year: 1} , {unique: true}) ; 

payrollSchema.pre("save" , function(){
    this.netSalary = this.basicSalary + this.allowances - this.deductions ;
}) ;

module.exports = mongoose.model("Payroll" , payrollSchema) ;