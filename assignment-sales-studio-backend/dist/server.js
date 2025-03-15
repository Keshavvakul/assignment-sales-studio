"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
// Coupon creation route
app.post("/add-coupons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codes } = req.query;
    if (!codes || typeof codes !== "string") {
        res.status(400).json({ message: "No coupons provided" });
        return;
    }
    const couponArray = codes
        .split(",")
        .map((code) => code.trim())
        .filter((code) => code.length > 0)
        .map((code) => ({ code }));
    try {
        yield prisma.coupon.createMany({
            data: couponArray,
            skipDuplicates: true,
        });
        res.json({ message: "Coupons added successfully!" });
    }
    catch (e) {
        console.error("Error adding coupons:", e);
        res.status(500).json({ message: "Failed to add coupons" });
    }
}));
app.get("/claim-coupon", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIp = (req.ip || req.headers["x-forwarded-for"] || "unknown").toString();
    const userAgent = (req.headers["user-agent"] || "unknown").toString();
    const userCookie = req.cookies.claimToken;
    try {
        if (!userCookie) {
            const uniqueToken = `${userIp}-${Date.now()}`;
            res.cookie("claimToken", uniqueToken, { maxAge: 60 * 60 * 1000 });
        }
        const lastClaimed = yield prisma.claim.findFirst({
            where: { ipAddress: userIp, userAgent },
            orderBy: { claimedAt: "desc" }
        });
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (lastClaimed && lastClaimed.claimedAt > oneHourAgo) {
            const remainingTime = Math.ceil((lastClaimed.claimedAt.getTime() + 60 * 60 * 1000 - Date.now()) / 60000);
            res.status(429).json({ message: `You've already claimed a coupon. Try again in ${remainingTime} minutes.` });
        }
        const availableCoupons = yield prisma.coupon.findFirst({
            where: { status: "available" },
            orderBy: { id: "asc" }
        });
        if (!availableCoupons) {
            res.json({ message: "No coupons available" });
            return;
        }
        yield prisma.coupon.update({
            where: { id: availableCoupons.id },
            data: { status: "used" }
        });
        yield prisma.claim.create({
            data: { ipAddress: userIp, userAgent }
        });
        res.json({ message: "Coupon claimed!", coupon: availableCoupons.code });
    }
    catch (e) {
        console.error(e);
        res.json({ message: "Something went wrong inside claim-coupon handler" });
    }
}));
app.get("/coupons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const availableCoupons = yield prisma.coupon.findMany({
            where: { status: "available" },
            orderBy: { id: "asc" },
        });
        if (availableCoupons.length === 0) {
            res.status(404).json({ message: "No coupons available" });
            return;
        }
        res.json(availableCoupons);
    }
    catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ message: "Failed to fetch coupons" });
    }
}));
// Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
