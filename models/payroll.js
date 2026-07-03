const mongoose = require('mongoose') ;

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
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
      ref: "User",
    },
} , {
    timestamps: true
})

payrollSchema.index({employeeId: 1 , month: 1 , year: 1} , {unique: true}) ; 

payrollSchema.pre("save" , function(next){
    this.netSalary = this.baseSalary + this.allowances - this.deductions ;
    next() ;
}) ;

module.exports = mongoose.model("Payroll" , payrollSchema) ;