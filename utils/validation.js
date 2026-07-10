const validator = require('validator') ;

const validateSignup = (req) => {
    const {firstName , lastName , emailId , password} = req.body ;

    const fail = (msg) => { const e = new Error(msg); e.statusCode = 400; throw e; };

    if(!firstName || !lastName) fail("name is required") ;
    else if(!emailId) fail("email is required") ;
    else if(!password) fail("password is required") ;
    else if(!validator.isEmail(emailId)) fail("please enter valid email") ;
    else if(!validator.isStrongPassword(password)) fail("please enter strong password") ;
}

module.exports = {validateSignup} ;