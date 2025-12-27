import pool from '../db.js';
import { removeUndefined } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import { sendMail } from "../utils/sendMail.js";
import { partnerEmailTemplate, adminEmailTemplate, partnerApprovedTemplate, partnerRejectedTemplate } from '../utils/referralTemplates.js';

// Admin email (you can set in .env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Helper: Create insertable data
const buildInsertData = (data, fields) =>
    fields.reduce((acc, key) => {
        if (data[key] !== undefined) acc[key] = data[key];
        return acc;
    }, {});


// Create Partner Application
export const createPartner = async (req, res) => {
    try {
        const data = removeUndefined(req.body);

        // 🔍 Required fields validation
        const requiredFields = [
            "name", "email", "description", "website",
            "platform", "mobilePhone", "organization", "country", "city"
        ];
        const missing = requiredFields.filter((f) => !data[f]);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`,
            });
        }

        const db = pool.promise();
        // 🔍 Check if email already exists in partner table
        const [partnerRows] = await db.execute(
            "SELECT id, status FROM partner WHERE email = ?",
            [data.email]
        );

        if (partnerRows.length > 0) {
            const existingPartner = partnerRows[0];

            if (existingPartner.status === "pending" || existingPartner.status === "approved") {
                return res.status(400).json({
                    success: false,
                    message: `This email is already registered as a Partner with status '${existingPartner.status}'`,
                });
            }

            if (existingPartner.status === "rejected") {
                // ✅ Delete old rejected partner so new one can be created
                await db.execute("DELETE FROM partner WHERE id = ?", [existingPartner.id]);
            }
        }

        // 🔍 Check if email exists in admin
        const [adminRows] = await db.execute(
            "SELECT id FROM admin WHERE email = ?",
            [data.email]
        );
        if (adminRows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered as an Admin",
            });
        }

        if (partnerRows.length > 0) {
            return res.status(400).json({ success: false, message: "This email is already registered as a Partner" });
        }
        if (adminRows.length > 0) {
            return res.status(400).json({ success: false, message: "This email is already registered as an Admin" });
        }

        // 📝 Insert Partner
        const fields = [
            "name", "email", "description", "website",
            "platform", "organization", "mobilePhone", "country", "city",
        ];
        const insertData = buildInsertData(data, fields);

        const fieldNames = Object.keys(insertData);
        const placeholders = fieldNames.map(() => "?").join(", ");
        const values = fieldNames.map((k) => insertData[k]);

        const query = `INSERT INTO partner (${fieldNames.join(", ")}) VALUES (${placeholders})`;
        const [result] = await db.execute(query, values);

        // 📧 Send Emails in Parallel
        await Promise.all([
            sendMail(data.email, "Welcome to our Partner Program", partnerEmailTemplate(data)),
            sendMail(ADMIN_EMAIL, "New Partner Application Received", adminEmailTemplate(data)),
        ]);

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

export const getAllPartners = async (req, res) => {
    try {
        const db = pool.promise();
        const [results] = await db.execute("SELECT * FROM partner");

        // har record se password remove karo
        const sanitizedResults = results.map(({ password, ...rest }) => rest);

        return res.status(200).json({
            success: true,
            message: "Partners fetched successfully",
            data: sanitizedResults,
        });
    } catch (error) {
        console.error("Error fetching partners:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch partners",
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
        const [rows] = await db.execute("SELECT * FROM partner WHERE id = ?", [partnerId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        const partner = rows[0];

        if (partner.status === "approved") {
            return res.status(400).json({ success: false, message: "Partner is already approved" });
        }

        if (partner.status === "rejected") {
            return res.status(400).json({ success: false, message: "Partner is already rejected" });
        }

        // Generate random password
        const plainPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Generate unique referral code
        const referenceLink = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Update DB
        const query = `
      UPDATE partner 
      SET password = ?, isRegistered = true, refernceLink = ?, status = 'approved'
      WHERE id = ?
    `;
        await db.execute(query, [hashedPassword, referenceLink, partnerId]);

        // -------------------
        // 📩 Send Email
        // -------------------
        // Send approval email using template
        await sendMail(
          partner.email,
          "Your Partner Account Has Been Approved 🎉",
          partnerApprovedTemplate(partner, plainPassword, referenceLink)
        );


        return res.status(200).json({
            success: true,
            message: "Partner approved successfully & email sent",
            password: plainPassword,
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

// Update Partner Profile
export const updatePartner = async (req, res) => {
    try {
        const updateData = removeUndefined(req.body);

        // Check if partner ID is provided
        if (!updateData.id) {
            return res.status(400).json({ success: false, message: "Partner ID is required" });
        }

        // Check if there is at least one field to update
        if (Object.keys(updateData).length <= 1) {
            return res.status(400).json({ success: false, message: "At least one field is required to update" });
        }

        // 🔐 Encrypt password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            delete updateData.password;
        }

        const db = pool.promise();

        // Dynamically build update query
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (key !== "id") {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }

        values.push(updateData.id);

        const query = `
            UPDATE partner
            SET ${fields.join(", ")}
            WHERE id = ?
        `;
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        // ✅ Fetch updated partner data
        const [rows] = await db.query(
            `SELECT id, name, email, 'partner' AS type, refernceLink, profileImage, 'partner' AS role 
             FROM partner WHERE id = ?`,
            [updateData.id]
        );

        return res.status(200).json({
            success: true,
            message: "Partner updated successfully",
            data: rows[0] || null
        });
    } catch (error) {
        console.error("Error updating partner:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update partner",
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
        const [rows] = await db.execute("SELECT email, name, status FROM partner WHERE id = ?", [partnerId]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Partner not found" });
        }

        const partner = rows[0];

        if (partner.status === "rejected") {
            return res.status(400).json({ success: false, message: "Partner already rejected" });
        }
        if (partner.status === "approved") {
            return res.status(400).json({ success: false, message: "Approved partner cannot be rejected" });
        }

        // Update status
        await db.execute("UPDATE partner SET status = 'rejected' WHERE id = ?", [partnerId]);

        // 📩 Send rejection email
        await sendMail(partner.email, "Partnership Request Rejected ❌", partnerRejectedTemplate(partner));

        return res.status(200).json({
            success: true,
            message: "Partner rejected successfully & email sent",
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


// Get Single Partner
export const getPartner = async (req, res) => {
    try {
        const { partnerId } = req.params;

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: "Partner ID is required",
            });
        }

        const db = pool.promise();

        // Partner fetch karo
        const [rows] = await db.execute("SELECT * FROM partner WHERE id = ?", [partnerId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            });
        }

        // password field remove karo
        const { password, ...partner } = rows[0];

        return res.status(200).json({
            success: true,
            message: "Partner fetched successfully",
            data: rows[0],
        });
    } catch (error) {
        console.error("Error fetching partner:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch partner",
            error: error.message,
        });
    }
};
