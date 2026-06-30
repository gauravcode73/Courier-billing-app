"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const billController = __importStar(require("../controllers/bill.controller"));
const reportController = __importStar(require("../controllers/report.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// --- Auth Routes ---
router.post('/auth/login', authController.login);
router.get('/auth/verify', auth_middleware_1.authenticateJWT, authController.verifyToken);
// --- Billing CRUD Routes ---
router.get('/bills/numbers', auth_middleware_1.authenticateJWT, billController.getLatestNumbers);
router.post('/bills', auth_middleware_1.authenticateJWT, billController.createBill);
router.get('/bills', auth_middleware_1.authenticateJWT, billController.getBills);
router.get('/bills/:consignmentNumber', auth_middleware_1.authenticateJWT, billController.getBillByConsignment);
router.put('/bills/:consignmentNumber', auth_middleware_1.authenticateJWT, billController.updateBill);
router.delete('/bills/:consignmentNumber', auth_middleware_1.authenticateJWT, billController.deleteBill);
router.get('/bills/:consignmentNumber/pdf', auth_middleware_1.authenticateJWT, billController.downloadPdf);
// --- Report & Export Routes ---
router.get('/reports/stats', auth_middleware_1.authenticateJWT, reportController.getDashboardStats);
router.get('/reports/export/excel', auth_middleware_1.authenticateJWT, reportController.exportExcel);
router.get('/reports/export/csv', auth_middleware_1.authenticateJWT, reportController.exportCsv);
exports.default = router;
