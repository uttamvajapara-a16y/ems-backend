const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: "User" ,
        required: true
    } ,
    startDate: {
        type: Date ,
        required: true
    } ,
    endDate: {
        type: Date ,
        required: true ,
        validate: {
            validator: function(endDate) {
                return endDate >= this.startDate;
            },
            message: "End date must be greater than or equal to start date"
        }
    } ,
    totalDays: {
        type: Number
    } ,
    leaveType: {
        type: String ,
        enum: ["casual", "sick", "maternity", "paternity", "unpaid" , "paid"] ,
        required: true
    } ,
    reason: {
        type: String ,
        required: true ,
        trim: true ,
        minLength: [10 , "Reason must be at least 10 characters"],
        maxLength: [100 , "Reason can not exceed 100 characters"]
    } ,
    status: {
        type: String ,
        enum: ["pending", "approved", "rejected" , "cancelled"] ,
        default: "pending"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
},{
    timestamps: true
})

leaveSchema.pre("save" , function(next){
    if(this.startDate && this.endDate){
        const diffTime = this.endDate - this.startDate ;
        this.totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 ;
    }
    next()
})

module.exports = mongoose.model("Leave" , leaveSchema) ;