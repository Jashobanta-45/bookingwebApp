import express from "express";
import { protect, admin } from "../middleware/auth.middileware.js";
import { bookEvent, sendBookingOtp, getMyBooking, confirmBooking, cancelBooking } from "../controller/bookig.controller.js";
const router = express.Router();

router.post("/", protect,bookEvent);
router.get("/send-Otp", protect, sendBookingOtp);
router.get("/my",protect ,getMyBooking);
router.put("/:id/confrim", protect, admin, confirmBooking);
router.delete("/:id", protect, admin, cancelBooking);

export default router;