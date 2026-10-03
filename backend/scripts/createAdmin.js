require("dotenv").config();
const mongoose = require("mongoose");
const connectDatabase = require("../src/config/db");
const User = require("../src/models/User");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before running this script.");
  }
  if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  await connectDatabase();
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    if (existing.role !== "admin") {
      throw new Error("ADMIN_EMAIL is already used by a non-admin account. Choose a different email.");
    }
    console.log(`Admin account already exists: ${existing.email}`);
    return;
  }
  const user = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin"
  });
  console.log(`Admin account created: ${user.email}`);
}

createAdmin()
  .catch((error) => {
    console.error(`Unable to create admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
