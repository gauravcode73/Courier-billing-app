"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const api_routes_1 = __importDefault(require("./routes/api.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security configuration
app.use((0, helmet_1.default)());
// CORS configuration (allow requests from Vite frontend)
app.use((0, cors_1.default)({
    origin: '*', // For development, allow all. In production, configure to frontend domain.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Global Rate Limiting: 200 requests per 15 minutes per IP
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
// API Routes
app.use('/api', api_routes_1.default);
// Base route health check
app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Centralized error handler middleware
app.use((err, _req, res, _next) => {
    console.error('🔥 Server Error Caught:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
app.listen(PORT, () => {
    console.log(`🚀 AmodXpress Billing System server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
