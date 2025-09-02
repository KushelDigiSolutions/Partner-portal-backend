import pool from '../db.js';
import { removeUndefined } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import { sendMail, partnerEmailTemplate, adminEmailTemplate } from "../utils/sendMail.js";

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
            "platform", "affiliate_handle", "mobilePhone",
        ];
        const missing = requiredFields.filter((f) => !data[f]);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(", ")}`,
            });
        }

        const db = pool.promise();

        // 🔍 Check email in both partner & admin
        const [[partnerRows], [adminRows]] = await Promise.all([
            db.execute("SELECT id FROM partner WHERE email = ?", [data.email]),
            db.execute("SELECT id FROM admin WHERE email = ?", [data.email]),
        ]);

        if (partnerRows.length > 0) {
            return res.status(400).json({ success: false, message: "This email is already registered as a Partner" });
        }
        if (adminRows.length > 0) {
            return res.status(400).json({ success: false, message: "This email is already registered as an Admin" });
        }

        // 📝 Insert Partner
        const fields = [
            "name", "email", "description", "website",
            "platform", "affiliate_handle", "additional_info", "mobilePhone",
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

        await sendMail(partner.email, "Your Partner Account Has Been Approved 🎉", `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; padding:20px;">
          <h2 style="color:#2E86C1;">Welcome to Our Partner Program!</h2>
          <p>Dear <strong>${partner.fullname}</strong>,</p>
          <p>We are excited to inform you that your partner account has been <span style="color:green;font-weight:bold;">approved</span>.</p>
          
          <h3>🔑 Your Login Details:</h3>
          <p><b>Email:</b> ${partner.email}</p>
          <p><b>Password:</b> ${plainPassword}</p>
          
          <h3>📌 Your Referral Code:</h3>
          <p><b>${referenceLink}</b></p>

          <p>You can now log in and start using your partner dashboard.</p>

          <a href="https://yourdomain.com/login" 
             style="background:#2E86C1;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
             Login Now
          </a>

          <br/><br/>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards, <br/>Partner Support Team</p>
        </div>
      `,)


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
        await sendMail(
            partner.email,
            "Partnership Request Rejected ❌",
            `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; padding:20px;">
        <h2 style="color:#E74C3C;">Partnership Request Update</h2>
        <p>Dear <strong>${partner.name}</strong>,</p>
        <p>We regret to inform you that your partnership request has been 
        <span style="color:red;font-weight:bold;">rejected</span>.</p>

        <p>You may re-apply in the future after meeting the required criteria.</p>

        <br/>
        <p>Best regards,<br/>Partner Support Team</p>
      </div>
      `
        );

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
