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

router.post("/",createReferral);       // Create
router.get("/",  getAllReferrals);       // Get all (with partner details)
router.get("/:id",  getReferralById);    // Get by ID (with partner details)
router.put("/:id", updateReferral);     // Update
router.delete("/:id",  deleteReferral);  // Delete

export default router;
