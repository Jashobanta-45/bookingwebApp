import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendBookingEmail = async (email, userName, eventTitle) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation - ${eventTitle}`,
      html: `
        <div style="max-width:500px;margin:auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;">
          <h2 style="color:#2563eb;text-align:center;">🎉 Booking Confirmed</h2>

          <p>Hi <strong>${userName}</strong>,</p>

          <p>Your booking has been confirmed successfully.</p>

          <p><strong>Event:</strong> ${eventTitle}</p>

          <p>Thank you for booking with us. We look forward to seeing you at the event!</p>

          <hr>

          <p style="font-size:12px;color:#777;text-align:center;">
            © ${new Date().getFullYear()} Event Booking System
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Booking confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};



const sendOtpEmail = async (email, otp, type) => {
  try {
    const title =
      type === "account_verification"
        ? "Verify Your Account"
        : "Event Booking Verification";

    const msg =
      type === "account_verification"
        ? "Please use the following OTP to verify your account."
        : "Please use the following OTP to confirm your event booking.";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: title,
      html: `
        <div style="max-width:500px;margin:auto;padding:20px;font-family:Arial,sans-serif;border:1px solid #ddd;border-radius:8px;">
          <h2 style="color:#2563eb;text-align:center;">BookStore</h2>

          <p>Hello,</p>

          <p>${msg}</p>

          <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:5px;color:#2563eb;border-radius:6px;">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>5 minutes</strong>.</p>

          <p>If you didn't request this, you can safely ignore this email.</p>

          <hr>

          <p style="font-size:12px;color:#888;text-align:center;">
            © ${new Date().getFullYear()} BookStore
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email} for ${type}`);
  } catch (error) {
    console.log("Error sending OTP email:", error);
  }
};

export  {sendBookingEmail ,sendOtpEmail};