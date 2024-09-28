const Admin = require('../models/admin');

const authorizeAdmin = (requiredRole) => {
    return async (req, res, next) => {
        const adminId = req.admin.id;
        const admin = await Admin.findByPk(adminId);

        if (!admin || admin.role !== requiredRole) {
            return res.status(403).json({ error: 'Yeterli yetkiniz yok.' })
        }

        next();
    }
}

module.exports = { authorizeAdmin }