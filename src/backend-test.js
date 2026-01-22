// src/backend-test.js
import dotenv from "dotenv";
import {
  testEmailConnection,
  sendPasswordResetEmail,
} from "./services/emailService.js";

dotenv.config();

const runTest = async () => {
  console.log("🧪 Testing email service...\n");

  console.log("1️⃣ Testing configuration...");
  console.log(
    "   SENDGRID_VERIFIED_SENDER:",
    process.env.SENDGRID_VERIFIED_SENDER || "❌ NOT SET",
  );
  console.log(
    "   FRONTEND_URL:",
    process.env.FRONTEND_URL || "http://localhost:3000",
  );

  const isConfigured = await testEmailConnection();
  if (!isConfigured) return;

  console.log("\n2️⃣ Sending test email to yourself...");
  try {
    await sendPasswordResetEmail(
      process.env.SENDGRID_VERIFIED_SENDER,
      "test-token-12345",
    );

    console.log(
      "\n✅ Test email sent to:",
      process.env.SENDGRID_VERIFIED_SENDER,
    );
    console.log("📧 Check your inbox (and spam folder!)");
  } catch (error) {
    console.log("\n❌ Failed:", error.message);
  }
};

runTest();
