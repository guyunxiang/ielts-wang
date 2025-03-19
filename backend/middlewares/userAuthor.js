const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    // Check if token exists in cookies
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided'
        });
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid token'
        });
    }
}
