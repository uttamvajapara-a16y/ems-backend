const express  = require("express") ;
const cors = require("cors");
const http = require("http");
const cookieParser = require('cookie-parser')
require("dotenv").config() ;


const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorHendler.middleware");
const authRouter = require("./routes/authRouter");
const employeeRouter = require("./routes/employeeRouter");
const departmentRouter = require("./routes/departmentRouter");
const attendanceRouter = require("./routes/attendanceRouter");
const leaveRouter = require("./routes/leaveRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const adminRouter = require("./routes/adminRouter");


const app = express();


app.use(express.json());
app.use(cookieParser()) ;


app.use(cors({
    origin : "*",
    methods : ["GET" , "POST" , "PUT" , "DELETE"],
}));


app.use("/api" , authRouter) ;
app.use("/api" , employeeRouter) ;
app.use("/api" , departmentRouter) ;
app.use("/api" , attendanceRouter) ;
app.use('/api' , leaveRouter) ;
app.use('/api' , dashboardRouter) ;
app.use("/api" , adminRouter) ;


app.use(errorHandler) ;


const server = http.createServer(app) ;

connectDB().then(() => {
    console.log("database connected successfully") ;
    server.listen(process.env.PORT , () => {
        console.log("server successfully running on port 6050") ;
    })
}).catch((err) => {
    console.error("somthing went wrong" + err.message) ;
})