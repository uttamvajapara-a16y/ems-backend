const errorHandler = (err , req , res , next) => {
    console.error(err.stack) ;
    const statusCode = err.statusCode || 500 ;
    const errMsg = err.message || "internal server error" ;

    res.status(statusCode).json({
        success : false ,
        error : errMsg
    })
}

module.exports = { errorHandler } ;