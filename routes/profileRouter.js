const { userAuth } = require("../middleware/auth.middleware");
const express = require("express");

const { getUser } = require("../controllers/profileController");

const profileRouter = express.Router() ;

profileRouter.get("/profile/view" , userAuth, getUser) ;

module.exports = profileRouter ;