const connectDB = require("./config/db") ;
const dotenv = require("dotenv") ;
const Admin = require("./models/admin") ;
const bcrypt = require("bcrypt") ;

dotenv.config() ;
connectDB() ;

const saveAdminUser = async () => {
    try{
        await Admin.deleteMany({}) ;

        const passwordHash = await bcrypt.hash("Admin@ems123", 12);

        const adminUser = await Admin.create({
            firstName: "Admin",
            lastName: "User",
            emailId: "admin@ems.com",
            password: passwordHash
        })

        console.log("admin saved successfully: ", adminUser) ;
        process.exit() ;
    } catch(err) {
        console.log("error with saving admin " , err.message) ;
        process.exit(1) ;
    }
}

saveAdminUser() ;