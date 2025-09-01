import pool from '../db.js';
import { removeUndefined } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import { sendMail } from "../utils/sendMail.js";

// Create Partner Application
export const createPartner = async (req, res) => {
    try {
        const data = removeUndefined(req.body);

        // Required fields validation
        if (
            !data.name ||
            !data.email ||
            !data.description ||
            !data.website ||
            !data.platform ||
            !data.affiliate_handle ||
            !data.mobilePhone
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled",
            });
        }

        const db = pool.promise();

        // Check email in partner table
        const [partnerRows] = await db.execute("SELECT id FROM partner WHERE email = ?", [data.email]);
        if (partnerRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered as a Partner",
            });
        }

        // Check email in admin table
        const [adminRows] = await db.execute("SELECT id FROM admin WHERE email = ?", [data.email]);
        if (adminRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered as an Admin",
            });
        }

        // Insert only valid fields
        const fields = [
            "name",
            "email",
            "description",
            "website",
            "platform",
            "affiliate_handle",
            "additional_info",
            "mobilePhone",
        ];

        const insertData = fields.reduce((acc, key) => {
            if (data[key] !== undefined) acc[key] = data[key];
            return acc;
        }, {});

        const fieldNames = Object.keys(insertData);
        const placeholders = fieldNames.map(() => "?").join(", ");
        const values = fieldNames.map((k) => insertData[k]);

        const query = `INSERT INTO partner (${fieldNames.join(", ")}) VALUES (${placeholders})`;
        const [result] = await db.execute(query, values);

        return res.status(201).json({
            success: true,
            message: "Partner application submitted successfully",
            partnerId: result.insertId,
        });
    } catch (error) {
        console.error("Error creating partner:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create partner",
            error: error.message,
        });
    }
};

// Approve Partner
export const approvePartner = async (req, res) => {
    try {
        const { partnerId } = req.body;
        if (!partnerId) {
            return res.status(400).json({ success: false, message: "Partner ID is required" });
        }

        const db = pool.promise();

        const [rows] = await db.execute("SELECT status FROM partner WHERE id = ?", [partnerId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        const status = rows[0].status;

        if (status === "approved") {
            return res.status(400).json({ success: false, message: "Partner is already approved" });
        }

        if (status === "rejected") {
            return res.status(400).json({ success: false, message: "Partner is already rejected" });
        }

        // Generate random password
        const plainPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Generate unique referral code
        const referenceLink = Math.random().toString(36).substring(2, 10).toUpperCase();

        const query = `
            UPDATE partner 
            SET password = ?, isRegistered = true, refernceLink = ?, status = 'approved'
            WHERE id = ?
        `;
        await db.execute(query, [hashedPassword, referenceLink, partnerId]);

        return res.status(200).json({
            success: true,
            message: "Partner approved successfully",
            password: plainPassword, // plain password for communication (email/SMS)
            referenceLink,
        });
    } catch (error) {
        console.error("Error approving partner:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve partner",
            error: error.message,
        });
    }
};

// Reject Partner
export const rejectPartner = async (req, res) => {
    try {
        const { partnerId } = req.body;
        if (!partnerId) {
            return res.status(400).json({ success: false, message: "Partner ID is required" });
        }

        const db = pool.promise();

        const [rows] = await db.execute("SELECT status FROM partner WHERE id = ?", [partnerId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        if (rows[0].status === "rejected") {
            return res.status(400).json({ success: false, message: "Partner already rejected" });
        }

        if (rows[0].status === "approved") {
            return res.status(400).json({ success: false, message: "Approved partner cannot be rejected" });
        }

        await db.execute("UPDATE partner SET status = 'rejected' WHERE id = ?", [partnerId]);

        return res.status(200).json({
            success: true,
            message: "Partner rejected successfully",
        });
    } catch (error) {
        console.error("Error rejecting partner:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject partner",
            error: error.message,
        });
    }
};
