"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'amodxpress_secret_jwt_key_12345';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
                return;
            }
            req.user = decoded;
            next();
        });
    }
    else {
        res.status(401).json({ error: 'Unauthorized: Access token missing' });
    }
};
exports.authenticateJWT = authenticateJWT;
