import pool from "../db.js"; // mysql2 pool connection
import { removeUndefined } from "../utils/helpers.js";

// Create Payment Record
export const createPartnerStorePayment = async (req, res) => {
    try {
        const { partner_id, store_id, amount, commission, start_date, end_date, status } = req.body;

        // Check mandatory fields
        if (!partner_id || !store_id || !amount || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        const db = pool.promise();
        await db.execute(
            `INSERT INTO store_payment 
        (partner_id, store_id, amount, commission, start_date, end_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [partner_id, store_id, amount, commission || 0.0, start_date, end_date, status || "paid"]
        );

        return res.status(201).json({
            success: true,
            message: "Payment record created successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error creating payment record",
            error: err.message,
        });
    }
};

// Read All Payments (optionally filter by partner/store)
export const getPartnersPayments = async (req, res) => {
    try {
        const { partner_id, store_id } = req.query;
        const db = pool.promise();

        let query = "SELECT * FROM store_payment WHERE 1=1";
        let params = [];

        if (partner_id) {
            query += " AND partner_id = ?";
            params.push(partner_id);
        }

        if (store_id) {
            query += " AND store_id = ?";
            params.push(store_id);
        }

        const [rows] = await db.execute(query, params);

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching payments",
            error: err.message,
        });
    }
};

export const getPartnerEarning = async (req, res) => {
    try {
        const { partner_id } = req.params;

        if (!partner_id) {
            return res.status(400).json({
                success: false,
                message: "partner_id is required",
            });
        }

        const db = pool.promise();

        // 🔹 Query with JOIN to include store details
        const [rows] = await db.execute(
            `
            SELECT 
                sp.id,
                sp.partner_id,
                sp.store_id,
                s.store_name, 
                s.store_owner,        
                s.platform,          
                sp.amount,
                sp.commission,
                sp.start_date,
                sp.end_date,
                sp.status,
                sp.created_at
            FROM store_payment sp
            JOIN store s ON sp.store_id = s.id
            WHERE sp.partner_id = ?
            ORDER BY sp.created_at DESC
            `,
            [partner_id]
        );

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        console.error("Error fetching partner earnings:", err);
        return res.status(500).json({
            success: false,
            message: "Error fetching payments",
            error: err.message,
        });
    }
};


// Get Single Payment by ID
export const getSinglePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();

        const [rows] = await db.execute("SELECT * FROM store_payment WHERE partner_id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching payment",
            error: err.message,
        });
    }
};

// Update Payment (Partial Update using removeUndefined)
export const updateStorePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = removeUndefined(req.body);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update",
            });
        }

        const setClause = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");

        const values = [...Object.values(updates), id];

        const db = pool.promise();
        const [result] = await db.execute(
            `UPDATE store_payment SET ${setClause} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error updating payment",
            error: err.message,
        });
    }
};

// Delete Payment
export const deleteStorePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();

        const [result] = await db.execute("DELETE FROM store_payment WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error deleting payment",
            error: err.message,
        });
    }
};
