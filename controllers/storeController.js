import pool from "../db.js"; // mysql2 pool connection
import { removeUndefined } from "../utils/helpers.js";

//  Create Store
export const createStore = async (req, res) => {
  try {
    let data = removeUndefined(req.body);

    if (!data.partner_id || !data.store_name || !data.platform || !data.store_owner) {
      return res.status(400).json({
        success: false,
        message: "partner_id, store_name, store_owner and platform are required",
      });
    }

    const db = pool.promise();

    // ✅ Check if partner exists
    const [rows] = await db.execute("SELECT id, status FROM partner WHERE id = ?", [data.partner_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Partner not found" });
    }

    const partner = rows[0];

    // ✅ Partner status validation
    if (partner.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Partner is not approved (current status: ${partner.status})`,
      });
    }

    // ✅ Insert Store
    const query = `
      INSERT INTO store (partner_id, store_name, store_owner, platform, earning, total_value, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      data.partner_id,
      data.store_name,
      data.store_owner,
      data.platform,
      data.earning || 0.0,
      data.total_value || 0.0,
      data.status || "active",
    ]);

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      storeId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create store",
      error: error.message,
    });
  }
};

//  Get All Stores
export const getAllStores = async (req, res) => {
  try {
    const db = pool.promise();
    const [stores] = await db.execute(
      `SELECT s.*, p.name AS partner_name, p.email AS partner_email
       FROM store s
       JOIN partner p ON s.partner_id = p.id`
    );

    return res.json({ success: true, data: stores });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
};

//  Get Store by ID
export const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = pool.promise();

    const [store] = await db.execute(
      `SELECT s.*, p.name AS partner_name, p.email AS partner_email
       FROM store s
       JOIN partner p ON s.partner_id = p.id
       WHERE s.id = ?`,
      [id]
    );

    if (store.length === 0) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    return res.json({ success: true, data: store[0] });
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch store",
      error: error.message,
    });
  }
};

export const getStoreByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const db = pool.promise();

    const [stores] = await db.execute(
      `SELECT s.*, p.name AS partner_name, p.email AS partner_email
       FROM store s
       JOIN partner p ON s.partner_id = p.id
       WHERE s.partner_id = ?`,
      [partnerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ success: false, message: "No stores found for this partner" });
    }

    return res.json({ success: true, data: stores });
  } catch (error) {
    console.error("Error fetching stores by partnerId:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stores",
      error: error.message,
    });
  }
};

//  Update Store
export const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    let data = removeUndefined(req.body);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: "No data provided for update" });
    }

    // Check inactive case
    if (data.status && data.status === "inactive" && !data.inactive_reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when deactivating a store",
      });
    }

    const db = pool.promise();

    // Dynamic fields update
    const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(data), id];

    const query = `UPDATE store SET ${fields} WHERE id = ?`;
    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    return res.json({ success: true, message: "Store updated successfully" });
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update store",
      error: error.message,
    });
  }
};

//  Delete Store
export const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const db = pool.promise();

    const [result] = await db.execute("DELETE FROM store WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    return res.json({ success: true, message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete store",
      error: error.message,
    });
  }
};
