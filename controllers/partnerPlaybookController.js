import pool from "../db.js"; // db connection file
import { removeUndefined } from "../utils/helpers.js"; // utility to clean undefined/null

// Create Playbook
export const createPlaybook = async (req, res) => {
    try {
        let data = removeUndefined(req.body);

        if (!data.title || !data.url) {
            return res.status(400).json({
                success: false,
                message: "Title and YouTube URL are required",
            });
        }

        const db = pool.promise();

        // Insert Playbook
        const query = `
            INSERT INTO partner_playbook (title, description, url) 
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            data.title,
            data.description || null,
            data.url,
        ]);

        return res.status(201).json({
            success: true,
            message: "Playbook created successfully",
            playbookId: result.insertId,
        });
    } catch (error) {
        console.error("Error creating playbook:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create playbook",
            error: error.message,
        });
    }
};

// Get All Playbooks
export const getAllPlaybooks = async (req, res) => {
    try {
        const db = pool.promise();
        const [rows] = await db.execute(`SELECT * FROM partner_playbook ORDER BY created_at DESC`);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching playbooks:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch playbooks",
            error: error.message,
        });
    }
};

// Get Playbook by ID
export const getPlaybookById = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();
        const [rows] = await db.execute(`SELECT * FROM partner_playbook WHERE id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Playbook not found" });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error fetching playbook:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch playbook",
            error: error.message,
        });
    }
};

// Update Playbook
export const updatePlaybook = async (req, res) => {
    try {
        const { id } = req.params;
        let data = removeUndefined(req.body);

        if (!data.title && !data.description && !data.url) {
            return res.status(400).json({
                success: false,
                message: "At least one field (title, description, url) is required to update",
            });
        }

        const db = pool.promise();

        // Check if playbook exists
        const [existing] = await db.execute(`SELECT id FROM partner_playbook WHERE id = ?`, [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: "Playbook not found" });
        }

        // Dynamic update query
        const fields = [];
        const values = [];
        for (let key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
        values.push(id);

        const query = `UPDATE partner_playbook SET ${fields.join(", ")} WHERE id = ?`;
        await db.execute(query, values);

        return res.status(200).json({ success: true, message: "Playbook updated successfully" });
    } catch (error) {
        console.error("Error updating playbook:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update playbook",
            error: error.message,
        });
    }
};

// Delete Playbook
export const deletePlaybook = async (req, res) => {
    try {
        const { id } = req.params;
        const db = pool.promise();

        const [result] = await db.execute(`DELETE FROM partner_playbook WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Playbook not found" });
        }

        return res.status(200).json({ success: true, message: "Playbook deleted successfully" });
    } catch (error) {
        console.error("Error deleting playbook:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete playbook",
            error: error.message,
        });
    }
};
