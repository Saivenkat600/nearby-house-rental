const Property = require("../models/Property");
const Favorite = require("../models/Favorite");
const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

function buildFilters(query) {
  const filter = {};
  if (query.available === undefined) filter.available = true;
  else if (query.available !== "") filter.available = query.available === true || query.available === "true";
  if (query.city) filter.city = new RegExp(`^${escapeRegex(query.city.trim())}$`, "i");
  if (query.locality) filter.locality = new RegExp(escapeRegex(query.locality.trim()), "i");
  if (query.propertyType) filter.propertyType = new RegExp(`^${escapeRegex(query.propertyType.trim())}$`, "i");
  if (query.furnishing) filter.furnishing = query.furnishing;
  if (query.bhk !== undefined || query.bedrooms !== undefined) {
    filter.bhk = Number(query.bhk === undefined ? query.bedrooms : query.bhk);
  }
  if (query.bathrooms !== undefined) filter.bathrooms = Number(query.bathrooms);
  if (query.amenities) {
    filter.amenities = {
      $all: (Array.isArray(query.amenities) ? query.amenities : query.amenities.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
    };
  }
  if (query.minRent !== undefined || query.maxRent !== undefined) {
    filter.rent = {};
    if (query.minRent !== undefined) filter.rent.$gte = Number(query.minRent);
    if (query.maxRent !== undefined) filter.rent.$lte = Number(query.maxRent);
  }
  if (query.availableFrom) filter.availableFrom = { $lte: new Date(query.availableFrom) };
  if (query.search) filter.$text = { $search: query.search.trim() };
  return filter;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listProperties = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const filter = buildFilters(req.query);
  const [properties, total] = await Promise.all([
    Property.find(filter)
      .populate("owner", "name email phone")
      .sort(req.query.sort === "rent_asc" ? { rent: 1 } : req.query.sort === "rent_desc" ? { rent: -1 } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Property.countDocuments(filter)
  ]);
  return sendSuccess(res, {
    data: { properties },
    meta: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

const nearbyProperties = asyncHandler(async (req, res) => {
  const longitude = Number(req.query.longitude ?? req.query.lng);
  const latitude = Number(req.query.latitude ?? req.query.lat);
  const maxDistance = req.query.radius !== undefined
    ? Number(req.query.radius) * 1000
    : Number(req.query.maxDistance || 10000);
  const properties = await Property.find({
    ...buildFilters(req.query),
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    }
  })
    .populate("owner", "name email phone")
    .limit(Number(req.query.limit || 20));
  return sendSuccess(res, { data: { properties } });
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("owner", "name email phone");
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  return sendSuccess(res, { data: { property } });
});

const createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({ ...normalizePropertyInput(req.body), owner: req.user.id });
  return sendSuccess(res, { statusCode: 201, message: "Property listed.", data: { property } });
});

const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  if (req.user.role !== "admin" && property.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "You can only edit your own listings." });
  }
  const editableFields = [
    "title",
    "description",
    "rent",
    "deposit",
    "address",
    "city",
    "locality",
    "bhk",
    "bedrooms",
    "bathrooms",
    "propertyType",
    "furnishing",
    "amenities",
    "images",
    "latitude",
    "longitude",
    "availableFrom",
    "location",
    "available"
  ];
  const updates = normalizePropertyInput(req.body);
  for (const field of editableFields) if (updates[field] !== undefined) property[field] = updates[field];
  await property.save();
  return sendSuccess(res, { message: "Property updated.", data: { property } });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  if (req.user.role !== "admin" && property.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "You can only remove your own listings." });
  }
  await property.deleteOne();
  await Promise.all([Favorite.deleteMany({ property: property.id }), Inquiry.deleteMany({ property: property.id })]);
  return sendSuccess(res, { message: "Property removed.", data: { propertyId: property.id } });
});

const listMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({ owner: req.user.id }).sort({ createdAt: -1 });
  return sendSuccess(res, { data: { properties } });
});

function normalizePropertyInput(input) {
  const values = { ...input };
  if (values.address && typeof values.address === "object") {
    const structuredAddress = values.address;
    values.city = values.city || structuredAddress.city;
    values.locality = values.locality || structuredAddress.locality;
    values.address = structuredAddress.street || [
      structuredAddress.street,
      structuredAddress.city,
      structuredAddress.state,
      structuredAddress.postalCode,
      structuredAddress.country
    ].filter(Boolean).join(", ");
  }
  if (values.bhk === undefined && values.bedrooms !== undefined) values.bhk = values.bedrooms;
  if (values.bedrooms === undefined && values.bhk !== undefined) values.bedrooms = values.bhk;
  if (values.latitude === undefined && Array.isArray(values.location?.coordinates)) {
    values.longitude = values.location.coordinates[0];
    values.latitude = values.location.coordinates[1];
  }
  if (typeof values.location !== "object") delete values.location;
  if (values.available === undefined && values.status !== undefined) {
    values.available = values.status === "available";
  }
  if (values.propertyType) {
    const labels = {
      apartment: "Apartment",
      house: "House",
      villa: "Villa",
      pg: "PG",
      room: "Room",
      studio: "Studio",
      other: "Other"
    };
    values.propertyType = labels[values.propertyType.toLowerCase()] || values.propertyType;
  }
  delete values.status;
  return values;
}

module.exports = {
  listProperties,
  nearbyProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  listMyProperties,
  normalizePropertyInput
};
