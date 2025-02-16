const { getCurrentTimestamp } = require('../utils/timestamp');

const requireAuth = (req, res, next) => {
    const timestamp = getCurrentTimestamp();

    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required',
            timestamp
        });
    }

    req.currentUser = {
        student_id: req.session.user.student_id,
        timestamp
    };
    
    next();
};

module.exports = { requireAuth };