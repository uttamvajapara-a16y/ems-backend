const mongoose = require('mongoose') ;


const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId ,
        refpath: "attenderModel" ,
        required: true
    } ,
    attenderModel: {
        type: String ,
        required: true ,
        enum: ["Employee", "HR"] 
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId ,
        required: true,
        ref: "Department"
    } ,
    date: {
        type: Date ,
        required: true ,
        default: () => new Date(new Date().setHours(0,0,0,0))
    } ,
    checkIn: {
        type: Date 
    } , 
    checkOut: {
        type: Date
    } ,
    status: {
        type: String ,
        enum: ["present", "absent", "half-day"],
        default: "present"
    } ,
    workingHours: {
        type: Number ,
        default: 0
    }
} , {
    timestamps: true
})

// to Prevent duplicate attendance entries for the same employee on the same day
attendanceSchema.index({employeeId: 1, date: 1}, {unique: true}) ;

attendanceSchema.pre("save", function () {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    this.workingHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);
    if(this.workingHours < 2) this.status = "absent";
    else
        this.status = this.workingHours >= 6 ? "present" : "half-day";
  }
});

module.exports = mongoose.model("Attendance" , attendanceSchema) ;