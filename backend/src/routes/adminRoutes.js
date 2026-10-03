const express = require("express");
const { body, param, query } = require("express-validator");
const controller = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authenticate, authorize("admin"));
router.get("/stats", controller.getStats);
router.get(
  "/users",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["tenant", "owner", "admin"]),
    query("search").optional().trim().isLength({ max: 100 })
  ],
  validate,
  controller.listUsers
);
router.delete("/users/:id", [param("id").isMongoId()], validate, controller.deleteUser);
router.patch(
  "/users/:id/role",
  [param("id").isMongoId(), body("role").isIn(["tenant", "owner", "admin"])],
  validate,
  controller.updateUserRole
);
router.patch(
  "/users/:id/status",
  [param("id").isMongoId(), body("isActive").isBoolean().toBoolean()],
  validate,
  controller.setUserActive
);
router.get("/properties", controller.listAllProperties);
router.put(
  "/properties/:id",
  [param("id").isMongoId(), body("available").isBoolean().toBoolean()],
  validate,
  controller.updateAnyProperty
);
router.delete("/properties/:id", [param("id").isMongoId()], validate, controller.deleteAnyProperty);

module.exports = router;
