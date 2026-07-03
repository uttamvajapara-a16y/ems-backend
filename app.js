const express  = require("express") ;
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const app = express();
require("dotenv").config() ;

app.use(cors({
    origin : "*",
    methods : ["GET" , "POST" , "PUT" , "DELETE"],
}));

app.get("/" , (req , res) => {
    res.send("server is running");
})

const server = http.createServer(app) ;

connectDB().then(() => {
    console.log("database connected successfully") ;
    server.listen(process.env.PORT , () => {
        console.log("server successfully running on port 6050") ;
    })
}).catch((err) => {
    console.error("somthing went wrong" + err.message) ;
})