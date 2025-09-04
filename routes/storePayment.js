import express from "express";
import pool from "../db.js";
import { createPartnerStorePayment, getPartnersPayments, getSinglePayment, updateStorePayment, deleteStorePayment } from "../controllers/storePayment.js";
import { requireRole } from '../middleware/auth.js';
const router = express.Router();


// Create Payment Record
router.post("/", requireRole(["admin", "super_admin"]), createPartnerStorePayment);


// Read All Payments (optionally filter by partner/store)
router.get("/", requireRole(["admin", "super_admin", "partner"]), getPartnersPayments);


// Get Single Payment by ID
router.get("/:id", requireRole(["admin", "super_admin", "partner"]), getSinglePayment);


// Update Payment
router.put("/:id", requireRole(["admin", "super_admin"]), updateStorePayment);


// Delete Payment
router.delete("/:id",requireRole(["admin", "super_admin"]), deleteStorePayment);


export default router;
