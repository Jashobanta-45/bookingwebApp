import express from "express";
import { protect, admin } from "../middleware/auth.middileware.js";
import Booking from "../model/booking.model.js";
import { sendOtpEmail, sendBookingEmail } from "../utils/email.js";
import OTP from "../model/otp.model.js";
import Event from "../model/event.model.js";

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendBookingOtp = async (req, res) => {
  const otp = generateOtp();
  await OTP.findOneAndDelete({
    email: req.user.email,
    action: "event_booking",
  });
  await OTP.create({
    email: req.user.email,
    otp,
    action: "event_booking",
  });
  await sendOtpEmail(req.user.email, otp, "event_booking");
  res.json({ message: "OTP sent successfully" });
};

const bookEvent = async (req, res) => {
  const { eventId, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP or expair otp" });
    }
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (event.totalSeat <= 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    const exstingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
    });
    if (exstingBooking) {
      return res.status(400).json({ error: "Event already booked" });
    }
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketprice,
    });
    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });
    res.status(201).json({ message: "Event booked successfully", booking });
  } catch {
    res.status(500).json({ error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  const paymentStatus = req.body.paymentStatus;
  if (!["paid", "not_paid"].includes(paymentStatus)) {
    return res.status(400).json({ error: "Invalid payment status" });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "confrimed") {
    return res.status(400).json({ error: "Booking already confirmed" });
  }
  const event = await Event.findById(booking.event);
  if (event.totalSeat <= 0) {
    return res.status(404).json({ error: "No seat available" });
  }
  booking.status = "confrimed";
  if (paymentStatus) {
    booking.paymentStatus = paymentStatus;
    event.totalSeat -= 1;
  }
  await booking.save();
  await sendBookingEmail(req.user.email, event.titel, booking._id);
  res.status(200).json({ message: "Booking confirmed successfully" });
};
const getMyBooking = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id });
  res.status(200).json(bookings);
};
const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  booking.status = "canceled";
  await booking.save();
  if (booking.status === "confrimed") {
    const event = await Event.findById(booking.eventId._id);
    event.totalSeat += 1;
    await event.save();
  }
  await booking.remove();
  res.status(200).json({ message: "Booking canceled successfully" });
};

export {
  bookEvent,
  sendBookingOtp,
  getMyBooking,
  confirmBooking,
  cancelBooking,
};
