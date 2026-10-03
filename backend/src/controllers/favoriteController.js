const Favorite = require("../models/Favorite");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({ path: "property", populate: { path: "owner", select: "name email phone" } })
    .sort({ createdAt: -1 });
  return sendSuccess(res, { data: { favorites } });
});

const addFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  const favorite = await Favorite.findOneAndUpdate(
    { user: req.user.id, property: property.id },
    { user: req.user.id, property: property.id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return sendSuccess(res, { statusCode: 201, message: "Property saved to favorites.", data: { favorite } });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({ user: req.user.id, property: req.params.propertyId });
  if (!favorite) return res.status(404).json({ success: false, message: "Favorite not found." });
  return sendSuccess(res, { message: "Favorite removed.", data: { propertyId: req.params.propertyId } });
});

module.exports = { listFavorites, addFavorite, removeFavorite };
