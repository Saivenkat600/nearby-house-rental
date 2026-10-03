const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { sendSuccess } = require("./utils/apiResponse");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
const configuredOrigins = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL;
app.use(cors({
  origin: configuredOrigins ? configuredOrigins.split(",").map((origin) => origin.trim()) : true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/api/health", (req, res) =>
  sendSuccess(res, {
    message: "API is running.",
    data: { status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
