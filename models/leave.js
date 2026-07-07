const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    applierId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "applierModel",   // <-- changed ref to refPath
    },
    applierModel: {
        type: String,
        required: true,
        enum: ["Employee", "Manager", "HR" , "Admin"],
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["Employee", "Manager", "HR" , "Admin"],
    } ,
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (endDate) {
                return endDate >= this.startDate;
            },
            message: "End date must be greater than or equal to start date"
        }
    },
    totalDays: {
        type: Number
    },
    leaveType: {
        type: String,
        enum: ["casual", "sick", "maternity", "paternity", "unpaid", "paid"],
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 100
    },
    status: {
        type: String,
        required: true ,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        refpath: "reviewerModel",
    },
    reviewerModel: {
        type: String,
        enum: ["HR" , "Admin"],
    },
    reviewedAt: {
        type: Date,
        default: null,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
})

leaveSchema.pre("save", function () {
    if (this.startDate && this.endDate) {
        const diffTime = this.endDate - this.startDate;
        this.totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
})

module.exports = mongoose.model("Leave", leaveSchema);