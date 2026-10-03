const express = require("express");
const { param } = require("express-validator");
const controller = require("../controllers/favoriteController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authenticate, authorize("tenant"));
router.get("/", controller.listFavorites);
router.post("/:propertyId", [param("propertyId").isMongoId()], validate, controller.addFavorite);
router.delete("/:propertyId", [param("propertyId").isMongoId()], validate, controller.removeFavorite);

module.exports = router;
