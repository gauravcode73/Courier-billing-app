import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as billController from '../controllers/bill.controller';
import * as reportController from '../controllers/report.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.get('/auth/verify', authenticateJWT, authController.verifyToken);

// --- Billing CRUD Routes ---
router.get('/bills/numbers', authenticateJWT, billController.getLatestNumbers);
router.post('/bills', authenticateJWT, billController.createBill);
router.get('/bills', authenticateJWT, billController.getBills);
router.get('/bills/:consignmentNumber', authenticateJWT, billController.getBillByConsignment);
router.put('/bills/:consignmentNumber', authenticateJWT, billController.updateBill);
router.delete('/bills/:consignmentNumber', authenticateJWT, billController.deleteBill);
router.get('/bills/:consignmentNumber/pdf', authenticateJWT, billController.downloadPdf);

// --- Report & Export Routes ---
router.get('/reports/stats', authenticateJWT, reportController.getDashboardStats);
router.get('/reports/export/excel', authenticateJWT, reportController.exportExcel);
router.get('/reports/export/csv', authenticateJWT, reportController.exportCsv);

export default router;
