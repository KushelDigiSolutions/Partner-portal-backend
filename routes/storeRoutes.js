import { Router } from "express";
import {
    createStore,
    getAllStores,
    getStoreById,
    getStoreByPartnerId,
    updateStore,
    deleteStore,
} from "../controllers/storeController.js";
import { requireRole } from '../middleware/auth.js';


const router = Router();

// Create a new store
router.post("/", requireRole(["admin", "super_admin"]), createStore);

// Get all stores
router.get("/", requireRole(["admin", "super_admin"]), getAllStores);

// Get store by store ID
router.get("/:id", requireRole(["admin", "super_admin", "partner"]), getStoreById);

// Get store by partner ID
router.get("/partner/:partnerId", requireRole(["admin", "super_admin", "partner"]), getStoreByPartnerId);

// Update store by store ID
router.put("/:id", requireRole(["admin", "super_admin"]), updateStore);

// Delete store by store ID
router.delete("/:id", requireRole(["admin", "super_admin"]), deleteStore);


export default router;
