const jwt = require('jsonwebtoken');

exports.tokenVerificationMiddleware = async(req, res, next) => {
    const token = (req.headers['authorization'] || '').split('Bearer ')[1];
    try {
        var user = jwt.verify(token, "konginwza");
    } catch (err){
        return res.status(403).json({ massage: err.name });
    }
    req.user = user;
    next();
};

