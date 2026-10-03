const express = require("express");
const { body, param, query } = require("express-validator");
const controller = require("../controllers/inquiryController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authenticate);
router.post(
  "/:propertyId",
  authorize("tenant"),
  [param("propertyId").isMongoId(), body("message").trim().isLength({ min: 5, max: 2000 }), body("phone").optional().trim().isLength({ max: 30 })],
  validate,
  controller.createInquiry
);
router.post(
  "/",
  authorize("tenant"),
  [
    body("property").isMongoId(),
    body("message").trim().isLength({ min: 5, max: 2000 }),
    body("phone").optional().trim().isLength({ max: 30 })
  ],
  validate,
  controller.createInquiry
);
router.get("/my", authorize("tenant"), controller.listInquiries);
router.get("/owner", authorize("owner"), controller.listInquiries);
router.get(
  "/",
  authorize("tenant", "owner", "admin"),
  [query("status").optional().isIn(["pending", "responded", "closed"])],
  validate,
  controller.listInquiries
);
router.patch(
  "/:id",
  authorize("owner", "admin"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["pending", "contacted", "responded", "closed"]),
    body("ownerResponse").optional().trim().isLength({ max: 2000 }),
    body().custom((value) => value.status !== undefined || value.ownerResponse !== undefined)
  ],
  validate,
  controller.updateInquiry
);
router.put(
  "/:id/status",
  authorize("owner", "admin"),
  [param("id").isMongoId(), body("status").isIn(["pending", "contacted", "responded", "closed"])],
  validate,
  controller.updateInquiry
);

module.exports = router;
