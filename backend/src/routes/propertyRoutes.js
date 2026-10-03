const express = require("express");
const { body, param, query } = require("express-validator");
const controller = require("../controllers/propertyController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
const propertyRules = (partial = false) => [
  body().custom((value) => {
    if (partial) return true;
    const hasLocation =
      (Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))) ||
      (Array.isArray(value.location?.coordinates) && value.location.coordinates.length === 2);
    const hasAddress = value.address && (typeof value.address === "string" || typeof value.address === "object");
    if (!value.title || !value.description || value.rent === undefined || !hasAddress) {
      throw new Error("Title, description, rent, and address are required.");
    }
    if (!value.city && !value.address?.city) throw new Error("City is required.");
    if (value.bhk === undefined && value.bedrooms === undefined) throw new Error("Bedrooms (BHK) is required.");
    if (!hasLocation) throw new Error("Latitude and longitude are required.");
    return true;
  }),
  body("title").optional().trim().isLength({ min: 5, max: 120 }),
  body("description").optional().trim().isLength({ min: 5, max: 5000 }),
  body("propertyType").optional().isIn(["Apartment", "House", "Villa", "PG", "Room", "Studio", "Other", "apartment", "house", "villa", "pg", "room", "studio", "other"]),
  body("furnishing").optional().isIn(["Fully Furnished", "Semi Furnished", "Unfurnished"]),
  body("rent").optional().isFloat({ min: 0 }),
  body("deposit").optional().isFloat({ min: 0 }),
  body("bhk").optional().isInt({ min: 0, max: 30 }),
  body("bedrooms").optional().isInt({ min: 0, max: 30 }),
  body("bathrooms").optional().isFloat({ min: 0, max: 30 }),
  body("address").optional().custom((value) => typeof value === "string" || (value && typeof value === "object")),
  body("city").optional().trim().isLength({ min: 1, max: 100 }),
  body("locality").optional().trim().isLength({ max: 100 }),
  body("latitude").optional().isFloat({ min: -90, max: 90 }),
  body("longitude").optional().isFloat({ min: -180, max: 180 }),
  body("availableFrom").optional().isISO8601(),
  body("location").optional().custom((value) => typeof value === "string" || (value && Array.isArray(value.coordinates) && value.coordinates.length === 2)),
  body("available").optional().isBoolean().toBoolean(),
  body("amenities").optional().isArray(),
  body("amenities.*").optional().isString().trim().isLength({ max: 60 }),
  body("images").optional().isArray(),
  body("images.*").optional().isString().trim().isLength({ max: 2048 }),
  body("status").optional().isIn(["available", "rented", "inactive"])
];

router.get(
  "/nearby",
  [
    query("longitude").optional().isFloat({ min: -180, max: 180 }),
    query("latitude").optional().isFloat({ min: -90, max: 90 }),
    query("lng").optional().isFloat({ min: -180, max: 180 }),
    query("lat").optional().isFloat({ min: -90, max: 90 }),
    query().custom((value) => {
      if (value.longitude === undefined && value.lng === undefined) throw new Error("Longitude is required.");
      if (value.latitude === undefined && value.lat === undefined) throw new Error("Latitude is required.");
      return true;
    }),
    query("radius").optional().isFloat({ min: 0.1, max: 100 }),
    query("maxDistance").optional().isInt({ min: 1, max: 100000 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minRent").optional().isFloat({ min: 0 }),
    query("maxRent").optional().isFloat({ min: 0 })
  ],
  validate,
  controller.nearbyProperties
);
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("minRent").optional().isFloat({ min: 0 }),
    query("maxRent").optional().isFloat({ min: 0 }),
    query("bedrooms").optional().isInt({ min: 0, max: 30 }),
    query("bhk").optional().isInt({ min: 0, max: 30 }),
    query("bathrooms").optional().isFloat({ min: 0, max: 30 }),
    query("amenities").optional().isString().trim().isLength({ min: 1, max: 60 }),
    query("availableFrom").optional().isISO8601(),
    query("propertyType").optional().isLength({ max: 40 }),
    query("furnishing").optional().isLength({ max: 40 }),
    query("available").optional().isIn(["true", "false", ""]),
    query("sort").optional().isIn(["newest", "rent_asc", "rent_desc"]),
    query("search").optional().trim().isLength({ max: 100 }),
    query("city").optional().trim().isLength({ max: 100 }),
    query("locality").optional().trim().isLength({ max: 100 })
  ],
  validate,
  controller.listProperties
);
router.get("/mine", authenticate, authorize("owner", "admin"), controller.listMyProperties);
router.get("/my", authenticate, authorize("owner", "admin"), controller.listMyProperties);
router.post("/", authenticate, authorize("owner", "admin"), propertyRules(), validate, controller.createProperty);
router.get("/:id", [param("id").isMongoId()], validate, controller.getProperty);
const updateRules = [param("id").isMongoId(), ...propertyRules(true)];
router.patch(
  "/:id",
  authenticate,
  authorize("owner", "admin"),
  updateRules,
  validate,
  controller.updateProperty
);
router.put("/:id", authenticate, authorize("owner", "admin"), updateRules, validate, controller.updateProperty);
router.delete("/:id", authenticate, authorize("owner", "admin"), [param("id").isMongoId()], validate, controller.deleteProperty);

module.exports = router;
