import express from "express";
import {
    createPlaybook,
    getAllPlaybooks,
    getPlaybookById,
    updatePlaybook,
    deletePlaybook
} from "../controllers/partnerPlaybookController.js";
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// CRUD Routes
router.post("/", requireRole(['admin', 'super_admin']), createPlaybook);
router.get("/", requireRole(['admin', 'super_admin','partner']), getAllPlaybooks);
router.get("/:id", requireRole(['admin', 'super_admin','partner']), getPlaybookById);
router.put("/:id", requireRole(['admin', 'super_admin']), updatePlaybook);
router.delete("/:id", requireRole(['admin', 'super_admin']), deletePlaybook);

export default router;
