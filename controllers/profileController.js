const getUser = async (req , res , next) => {
    try{
        const user = req.user ;
        res.send(user) ;
    } catch (err) {
        next(err) ;
    }
}

module.exports = { getUser } ;