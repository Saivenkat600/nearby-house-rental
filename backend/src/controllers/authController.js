const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const user = await User.create({ name, email, password, phone, role: role || "tenant" });
  return sendSuccess(res, {
    statusCode: 201,
    message: "Account created.",
    data: { user, token: createToken(user) }
  });
});

const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ success: false, message: "Email or password is incorrect." });
  }
  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "This account is not available." });
  }
  return sendSuccess(res, {
    message: "Signed in.",
    data: { user, token: createToken(user) }
  });
});

const getMe = asyncHandler(async (req, res) =>
  sendSuccess(res, { data: { user: req.user } })
);

module.exports = { register, login, getMe, createToken };
