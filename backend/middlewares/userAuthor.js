exports.authenticate = (req, res, next) => {
    // Check if userId exists in session
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
    // User is authenticated, continue to next middleware or route handler
    next();
}
