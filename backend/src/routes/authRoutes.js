const express = require("express");
const { body } = require("express-validator");
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 80 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 128 }),
    body("phone").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
    body("role").optional().isIn(["tenant", "owner"])
  ],
  validate,
  controller.register
);
router.post(
  "/login",
  [body("email").trim().isEmail().normalizeEmail(), body("password").isString().notEmpty()],
  validate,
  controller.login
);
router.get("/me", authenticate, controller.getMe);

module.exports = router;
