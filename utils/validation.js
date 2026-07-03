const validator = require('validator') ;

const validateSignup = (req) => {
    const {firstName , lastName , emailId , password} = req.body ;

    if(!firstName || !lastName){
        throw new Error("name is required") ;
    }
    else if(!emailId){
        throw new Error("email is required") ;
    }
    else if(!password){
        throw new Error("password is required") ;
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("please enter valid email") ;
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("please enter strong password") ;
    }
}

module.exports = {validateSignup} ;