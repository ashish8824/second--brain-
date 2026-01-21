// src/backend-test.js
import dotenv from "dotenv";
import {
  testEmailConnection,
  sendPasswordResetEmail,
} from "./services/emailService.js";

dotenv.config();

const runTest = async () => {
  console.log("🧪 Testing email service...\n");

  // Test 1: Check configuration
  console.log("1️⃣ Testing configuration...");
  console.log("   EMAIL_USER:", process.env.EMAIL_USER || "❌ NOT SET");
  console.log(
    "   EMAIL_APP_PASSWORD:",
    process.env.EMAIL_APP_PASSWORD ? "✅ SET" : "❌ NOT SET",
  );
  console.log(
    "   FRONTEND_URL:",
    process.env.FRONTEND_URL || "http://localhost:3000",
  );

  const isConfigured = await testEmailConnection();

  if (!isConfigured) {
    console.log("\n❌ Email configuration failed!");
    return;
  }

  // Test 2: Send test email
  console.log("\n2️⃣ Sending test email...");
  try {
    await sendPasswordResetEmail(process.env.EMAIL_USER, "test-token-12345");
    console.log("\n✅ Test email sent!");
    console.log("📧 Check inbox:", process.env.EMAIL_USER);
  } catch (error) {
    console.log("\n❌ Failed:", error.message);
  }
};

runTest();
