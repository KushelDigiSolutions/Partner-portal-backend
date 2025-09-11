import express from "express";
import {
    createReferral,
    getAllReferrals,
    getReferralById,
    updateReferral,
    deleteReferral
} from "../controllers/partnerReferralController.js";
import { requireRole } from '../middleware/auth.js';


const router = express.Router();

router.post("/", requireRole(['admin', 'super_admin', 'partner']), createReferral);       // Create
router.get("/", requireRole(['admin', 'super_admin', 'partner']), getAllReferrals);       // Get all (with partner details)
router.get("/:id", requireRole(['admin', 'super_admin', 'partner']), getReferralById);    // Get by ID (with partner details)
router.put("/:id", requireRole(['admin', 'super_admin', 'partner']), updateReferral);     // Update
router.delete("/:id", requireRole(['admin', 'super_admin', 'partner']), deleteReferral);  // Delete

export default router;
