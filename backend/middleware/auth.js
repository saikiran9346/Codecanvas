// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        // Verify token
        const secret = process.env.JWT_SECRET || "MY_SECRET_TOKEN";
        const decoded = jwt.verify(token, secret);
        
        // Attach user to request
        req.user = decoded;
        // console.log(1, decoded);
        
        next();
    } catch (err) {
        console.error('Auth error:', err.message);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

module.exports = auth;