import express, { NextFunction, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000

// Define types
type CouponCreateManyInput = Prisma.CouponCreateManyInput;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [
      "http://localhost:5173",
      "https://assignment-sales-studio-frontend.onrender.com/"
    ], 
    credentials: true 
  })
);

// Coupon creation route
  app.post("/add-coupons", async (req: Request, res: Response) => {
    const { codes } = req.query;
  
    if (!codes || typeof codes !== "string") {
      res.status(400).json({ message: "No coupons provided" });
      return
    }
  
    const couponArray: CouponCreateManyInput[] = codes
          .split(",")
          .map((code) => code.trim())
          .filter((code) => code.length > 0)
          .map((code) => ({ code }));
  
    try {
      await prisma.coupon.createMany({
        data: couponArray,
        skipDuplicates: true,
      });
      res.json({ message: "Coupons added successfully!" });
    } catch (e) {
      console.error("Error adding coupons:", e);
      res.status(500).json({ message: "Failed to add coupons" });
    }
  });

  app.get("/claim-coupon", async (req: Request, res: Response) => {
    const userIp = (req.ip || req.headers["x-forwarded-for"] || "unknown").toString()
    const userAgent = (req.headers["user-agent"] || "unknown").toString()
    const userCookie = req.cookies.claimToken;

    try {

        if (!userCookie) {
            const uniqueToken = `${userIp}-${Date.now()}`
            res.cookie("claimToken", uniqueToken, {maxAge: 60 * 60 * 1000})
            return
        }
 
        const lastClaimed = await prisma.claim.findFirst({
            where: {ipAddress: userIp, userAgent},
            orderBy: {claimedAt: "desc"}
        })

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        if (lastClaimed && lastClaimed.claimedAt > oneHourAgo) {
            const remainingTime = Math.ceil(
                (lastClaimed.claimedAt.getTime() + 60 * 60 * 1000 - Date.now()) / 60000
            )
            res.status(429).json({message: `You've already claimed a coupon. Try again in ${remainingTime} minutes.`})
            return
        }

        const availableCoupons = await prisma.coupon.findFirst({
            where: {status: "available"},
            orderBy: {id: "asc"}
        })

        if (!availableCoupons) {
            res.json({ message: "No coupons available"})
            return;
        }

        await prisma.coupon.update({
            where: {id: availableCoupons.id},
            data: {status: "used"}
        })

        await prisma.claim.create({
            data: {ipAddress: userIp, userAgent}
        })

        res.json({ message: "Coupon claimed!", coupon: availableCoupons.code });

    } catch (e) {
        console.error(e)
        res.json({ message: "Something went wrong inside claim-coupon handler"})
    }
  })

  app.get("/coupons", async (req: Request, res: Response) => {
    try {
      const availableCoupons = await prisma.coupon.findMany({
        where: { status: "available" },
        orderBy: { id: "asc" },
      });
  
      if (availableCoupons.length === 0) {
        res.status(404).json({ message: "No coupons available" });
        return;
      }
  
      res.json(availableCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

// Start the server
app.listen(port, () => console.log("Server running on http://localhost:3000"));
