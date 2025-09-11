import pool from "../db.js";
import { removeUndefined } from "../utils/helpers.js";

// Create Referral
export const createReferral = async (req, res) => {
  try {
    let data = removeUndefined(req.body);

    // 🔍 Required fields
    if (!data.name || !data.email || !data.store_name || !data.phone || !data.website || !data.country || !data.city) {
      return res.status(400).json({
        success: false,
        message: "Name, email, store_name, phone, website, country, and city are required"
      });
    }

    const db = pool.promise();

    // 🔹 Check duplicate email
    const [existing] = await db.execute(
      `SELECT 1 FROM partner_referrals WHERE email = ?`,
      [data.email]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in referrals"
      });
    }

    // 🔹 If referral_code provided, validate it exists in partner table
    if (data.referral_code) {
      const [partner] = await db.execute(
        `SELECT 1 FROM partner WHERE refernceLink = ?`,
        [data.referral_code]
      );
      if (partner.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral_code, no matching partner found"
        });
      }
    }

    // ✅ Insert all required fields according to table
    const query = `
      INSERT INTO partner_referrals 
      (name, email, store_name, website, phone, country, city, platform, status, referral_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      data.name,
      data.email,
      data.store_name,
      data.website || null,
      data.phone,
      data.country,
      data.city,
      data.platform || "bigcommerce",
      data.status || "New",
      data.referral_code || null
    ]);

    return res.status(201).json({
      success: true,
      message: "Referral created successfully",
      referralId: result.insertId
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create referral",
      error: error.message
    });
  }
};

// Get All Referrals with Partner Details
export const getAllReferrals = async (req, res) => {
    try {
        const db = pool.promise();
        const [rows] = await db.execute(`
            SELECT 
                r.*,
                p.id AS partner_id,
                p.name AS partner_name,
                p.email AS partner_email,
                p.website AS partner_website,
                p.platform AS partner_platform,
                p.refernceLink AS partner_reference_link,
                p.status AS partner_status
            FROM partner_referrals r
            LEFT JOIN partner p ON r.referral_code = p.refernceLink
            ORDER BY r.created_at DESC
        `);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching referrals:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch referrals",
            error: error.message
        });
    }
};

// Get Referral by ID with Partner Details
export const getReferralById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();

        const [rows] = await db.execute(`
            SELECT 
                r.*,
                p.id AS partner_id,
                p.name AS partner_name,
                p.email AS partner_email,
                p.website AS partner_website,
                p.platform AS partner_platform,
                p.refernceLink AS partner_reference_link,
                p.status AS partner_status
            FROM partner_referrals r
            LEFT JOIN partner p ON r.referral_code = p.refernceLink
            WHERE r.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Referral not found" });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error fetching referral:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch referral",
            error: error.message
        });
    }
};

// Update Referral
export const updateReferral = async (req, res) => {
    try {
        const { id } = req.params;
        let data = removeUndefined(req.body);

        if (!data.name && !data.email && !data.store_name && !data.website && !data.platform && !data.referral_code && !data.status) {
            return res.status(400).json({
                success: false,
                message: "At least one field must be provided for update"
            });
        }

        const db = pool.promise();

        // Check if referral exists
        const [existing] = await db.execute(`SELECT id FROM partner_referrals WHERE id = ?`, [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Referral not found" });
        }

        // Dynamic query
        const fields = [];
        const values = [];
        for (let key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
        values.push(id);

        const query = `UPDATE partner_referrals SET ${fields.join(", ")} WHERE id = ?`;
        await db.execute(query, values);

        return res.status(200).json({ success: true, message: "Referral updated successfully" });
    } catch (error) {
        console.error("Error updating referral:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update referral",
            error: error.message
        });
    }
};

// Delete Referral
export const deleteReferral = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();

        const [result] = await db.execute(`DELETE FROM partner_referrals WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Referral not found" });
        }

        return res.status(200).json({ success: true, message: "Referral deleted successfully" });
    } catch (error) {
        console.error("Error deleting referral:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete referral",
            error: error.message
        });
    }
};
