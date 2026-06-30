"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'amodxpress_secret_jwt_key_12345';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: { username },
            message: 'Login successful',
        });
    }
    else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
};
exports.login = login;
const verifyToken = async (req, res) => {
    // If the request passes the auth middleware, it is valid
    res.json({
        valid: true,
        user: req.user,
    });
};
exports.verifyToken = verifyToken;
