
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

// Flexible role-based middleware
export function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: false, message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            // decoded.type: 'admin' | 'partner', decoded.role: 'admin' | 'super_admin'
            if (allowedRoles.length > 0) {
                // Check type or role
                if (!allowedRoles.includes(decoded.type) && !allowedRoles.includes(decoded.role)) {
                    return res.status(403).json({ status: false, message: 'You do not have permission for this action' });
                }
            }
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ status: false, message: 'Invalid or expired token' });
        }
    };
}
