import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';

const JWT_SECRET = process.env.JWT_SECRET;
import crypto from "crypto";
import { profile } from 'console';
// import bcrypt from "bcrypt";

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
                { id: admin.id, email: admin.email, role: admin.role, type: "admin"},
                JWT_SECRET,
                { expiresIn: "500d" }
            );

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, type: "admin", profileImage: admin.profileImage },
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
            { expiresIn: "500d" }
        );
        return res.status(200).json({
            success: true,
            message: "Partner login successful",
            token,
            user: { id: partner.id, name: partner.name, email: partner.email, type: "partner", refernceLink: partner.refernceLink, profileImage: partner.profileImage, role: partner.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const db = pool.promise();

        // Check in both admin and partner
        const [admins] = await db.execute("SELECT * FROM admin WHERE email = ?", [email]);
        const [partners] = await db.execute("SELECT * FROM partner WHERE email = ?", [email]);

        let user = null;
        let role = null;

        if (admins.length > 0) {
            user = admins[0];
            role = "admin";
        } else if (partners.length > 0) {
            user = partners[0];
            role = "partner";
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "Email not registered" });
        }

        if (!user.password) {
            return res.status(403).json({ success: false, message: `${role} not registered yet by admin` });
        }

        // Generate 6-digit OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Expiry = 10 mins
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Remove old OTP
        await db.execute("DELETE FROM otp WHERE email = ?", [email]);

        // Save new OTP
        await db.execute(
            "INSERT INTO otp (email, otp_code, expires_at) VALUES (?, ?, ?)",
            [email, otpCode, expiresAt]
        );

        // Send email
        const subject = "Password Reset OTP - KRC Customizer";
        const html = `
            <p>Your OTP for password reset is: <b>${otpCode}</b></p>
            <p>This OTP will expire in 10 minutes.</p>
        `;

        await sendMail(email, subject, html);

        return res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.error("Forget password error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




export const validateOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const db = pool.promise();
        const [rows] = await db.execute("SELECT * FROM otp WHERE email = ? AND otp_code = ?", [
            email,
            otp,
        ]);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        const record = rows[0];

        // Check expiry
        if (new Date() > new Date(record.expires_at)) {
            await db.execute("DELETE FROM otp WHERE email = ?", [email]);
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // OTP valid → generate reset_token
        const resetToken = crypto.randomBytes(32).toString("hex");

        await db.execute("UPDATE otp SET reset_token = ? WHERE email = ?", [resetToken, email]);

        return res.status(200).json({
            success: true,
            message: "OTP validated successfully",
            resetToken
        });
    } catch (error) {
        console.error("Validate OTP error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, resetToken } = req.body;

        if (!email || !newPassword || !resetToken) {
            return res.status(400).json({ success: false, message: "Email, new password and resetToken are required" });
        }

        const db = pool.promise();

        // verify resetToken
        const [rows] = await db.execute("SELECT * FROM otp WHERE email = ? AND reset_token = ?", [
            email,
            resetToken,
        ]);

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const record = rows[0];
        if (new Date() > new Date(record.expires_at)) {
            await db.execute("DELETE FROM otp WHERE email = ?", [email]);
            return res.status(400).json({ success: false, message: "Reset token expired" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 1. Admin check
        const [admins] = await db.execute("SELECT * FROM admin WHERE email = ?", [email]);
        if (admins.length > 0) {
            await db.execute("UPDATE admin SET password = ? WHERE email = ?", [hashedPassword, email]);
        } else {
            // 2. Partner check
            const [partners] = await db.execute("SELECT * FROM partner WHERE email = ?", [email]);
            if (partners.length > 0) {
                await db.execute("UPDATE partner SET password = ? WHERE email = ?", [hashedPassword, email]);
            } else {
                return res.status(404).json({ success: false, message: "User not found" });
            }
        }

        // delete reset_token (one time use)
        await db.execute("DELETE FROM otp WHERE email = ?", [email]);

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
