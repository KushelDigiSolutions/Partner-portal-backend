

import { Router } from 'express';
import { getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin } from '../controllers/adminController.js';
import { requireRole } from '../middleware/auth.js';


const router = Router();
router.get('/list', requireRole(['admin', 'super_admin']), getAllAdmins);
router.get('/detail/:id', requireRole(['admin', 'super_admin']), getAdminById);
router.post('/create', requireRole(['super_admin']), createAdmin);
router.put('/update/:id', requireRole(['admin', 'super_admin']), updateAdmin);
router.delete('/remove/:id', requireRole(['admin', 'super_admin']), deleteAdmin);

export default router;
