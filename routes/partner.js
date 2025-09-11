import { Router } from 'express';
import { createPartner, getAllPartners, approvePartner, rejectPartner, getPartner } from '../controllers/partnerController.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/register', createPartner);
router.get('/getAllPartners', requireRole(['admin', 'super_admin']), getAllPartners);
router.get('/getPartner/:partnerId', requireRole(['admin', 'super_admin', 'partner']), getPartner);
router.post('/approvePartner', requireRole(['admin', 'super_admin']), approvePartner);
router.post('/rejectPartner', requireRole(['admin', 'super_admin']), rejectPartner);


export default router;
