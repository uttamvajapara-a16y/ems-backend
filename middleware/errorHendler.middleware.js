const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const errMsg = err.message || "internal server error";

    if (err.name === "CastError") {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    res.status(statusCode).json({
        success: false,
        message: errMsg
    })
}

module.exports = { errorHandler };