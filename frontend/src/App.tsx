import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

// Define the coupon type
interface Coupon {
  id: string;
  code: string;
  discount?: number;
  expiresAt: string;
  category: string;
}

// Cooldown period in milliseconds (1 hour)
const COOLDOWN_PERIOD = 60 * 60 * 1000;
const url = "https://assignment-sales-studio-backend.onrender.com";

export default function CouponDistribution() {
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [onCooldown, setOnCooldown] = useState<boolean>(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let userId = Cookies.get("coupon_user_id");
    if (!userId) {
      userId = uuidv4();
      Cookies.set("coupon_user_id", userId, { expires: 7 });
    }
    setUserIdentifier(userId);
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (onCooldown && cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          const newValue = prev - 1000;
          if (newValue <= 0) {
            clearInterval(timer);
            setOnCooldown(false);
            return 0;
          }
          return newValue;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [onCooldown, cooldownRemaining]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${url}/coupons`);
      setAvailableCoupons(response.data);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      setMessage("Failed to load coupons");
    }
  };

  const claimCoupon = async () => {
    if (onCooldown) {
      setMessage(`Please wait ${formatTimeRemaining(cooldownRemaining)} before claiming another coupon.`);
      return;
    }

    try {
      const response = await axios.get(`${url}/claim-coupon`, {
        headers: { "X-User-Identifier": userIdentifier },
      });

      if (response.data.coupon) {
        setMessage(`🎉 You claimed the ${response.data.coupon}!`);
        fetchCoupons();
        setOnCooldown(true);
        setCooldownRemaining(COOLDOWN_PERIOD);
      } else {
        setMessage(response.data.message || "No coupons available");
      }
    } catch (error: any) {
      console.error("Error claiming coupon:", error);
      setMessage(error.response?.data?.message || "Failed to claim coupon. Try again later.");
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="bg-white shadow-lg p-8 rounded-xl text-center max-w-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">🎁 Coupon Distributor</h1>

        {message && <p className="text-red-500 mb-4">{message}</p>}

        {availableCoupons.length > 0 ? (
          <ul className="space-y-4">
            {availableCoupons.map((coupon) => (
              <li key={coupon.id} className="p-4 bg-green-100 border border-green-400 rounded-lg">
                <h3 className="font-bold text-lg">{coupon.code}</h3>
                <p className="text-sm text-gray-700">{coupon.discount}% off</p>
                <p className="text-xs text-gray-500">Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No coupons available</p>
        )}

        <button
          onClick={claimCoupon}
          className={`mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
            onCooldown ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={onCooldown}
        >
          {onCooldown ? `Cooldown: ${formatTimeRemaining(cooldownRemaining)}` : "🎁 Claim Coupon"}
        </button>
      </div>
    </div>
  );
}