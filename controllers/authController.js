import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const db = pool.promise();

        // 1. Check in Admin table
        const [admins] = await db.execute("SELECT * FROM admin WHERE email = ?", [email]);

        if (admins.length > 0) {
            const admin = admins[0];

            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid password" });
            }

            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: admin.role, type: "admin" },
                JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, type: "admin" },
            });
        }

        // 2. If not admin → check in Partner table
        const [partners] = await db.execute("SELECT * FROM partner WHERE email = ?", [email]);

        if (partners.length === 0) {
            return res.status(404).json({ success: false, message: "User not registered" });
        }

        const partner = partners[0];

        if (!partner.password) {
            return res.status(403).json({ success: false, message: "Partner not registered yet by admin" });
        }

        const isMatch = await bcrypt.compare(password, partner.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: partner.id, email: partner.email, role: partner.role, type: "partner" },
            JWT_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            success: true,
            message: "Partner login successful",
            token,
            user: { id: partner.id, name: partner.name, email: partner.email, type: "partner" },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
