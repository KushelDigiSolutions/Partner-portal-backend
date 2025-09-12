import pool from '../db.js';
import bcrypt from 'bcryptjs';
import { removeUndefined } from "../utils/helpers.js";
import { uploadToCloudinary } from '../utils/cloudnary.js';

// Get all admins
export const getAllAdmins = async (req, res) => {
    try {
        const db = pool.promise();
        const [results] = await db.execute("SELECT * FROM admin");

        return res.status(200).json({
            success: true,
            message: "Admins fetched successfully",
            data: results,
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admins",
            error: error.message,
        });
    }
};

// Get admin by ID
export const getAdminById = async (req, res) => {
    try {
        const db = pool.promise();
        const [results] = await db.execute("SELECT * FROM admin WHERE id = ?", [req.params.id]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Admin fetched successfully",
            data: results[0],
        });
    } catch (error) {
        console.error("Error fetching admin by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin",
            error: error.message,
        });
    }
};

// Create new admin
export const createAdmin = async (req, res) => {
    try {
        let data = removeUndefined(req.body);
        if (!data.name || !data.email || !data.password) {
            return res.status(400).json({ success: false, message: "Name, email, and password are required" });
        }

        const db = pool.promise();

        // Check duplicate email
        const [existing] = await db.execute("SELECT 1 FROM admin WHERE email = ?", [data.email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        data.password = await bcrypt.hash(data.password, 10);

        // Insert admin
        const query = `INSERT INTO admin (name, email, password) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [data.name, data.email, data.password]);

        return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            adminId: result.insertId,
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create admin",
            error: error.message,
        });
    }
};

// Update admin
export const updateAdmin = async (req, res) => {
    try {
        let updateData = removeUndefined(req.body);
        if (!Object.keys(updateData).length) {
            return res.status(400).json({ success: false, message: "At least one field is required" });
        }

        const db = pool.promise();

        // Check duplicate email (if email is being updated)
        if (updateData.email) {
            const [rows] = await db.execute(
                "SELECT 1 FROM admin WHERE email = ? AND id != ?",
                [updateData.email, req.params.id]
            );
            if (rows.length > 0) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }
        }

        // Hash password if updating
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Build update query
        const fields = Object.keys(updateData);
        const setClause = fields.map(key => `${key} = ?`).join(", ");
        const values = [...fields.map(k => updateData[k]), req.params.id];

        const query = `UPDATE admin SET ${setClause} WHERE id = ?`;
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Admin updated successfully",
        });
    } catch (error) {
        console.error("Error updating admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update admin",
            error: error.message,
        });
    }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
    try {
        const db = pool.promise();
        const [result] = await db.execute("DELETE FROM admin WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Admin deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete admin",
            error: error.message,
        });
    }
};

// post image to cloudinary and return the url and public_id
export const postImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({
                status: false,
                message: "No image file uploaded",
            });
        }

        const image = req.files.image;
        const details = await uploadToCloudinary(image.tempFilePath);

        return res.status(200).json({
            status: true,
            data: details?.secure_url,
            public_id: details?.public_id,
        });
    } catch (error) {
        console.error("Error in postImage:", error);
        return res.status(500).json({
            status: false,
            message: "Image upload failed",
            error: error.message,
        });
    }
};
