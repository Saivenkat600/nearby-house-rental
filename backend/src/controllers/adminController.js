const User = require("../models/User");
const Property = require("../models/Property");
const Favorite = require("../models/Favorite");
const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const safeSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [{ name: new RegExp(safeSearch, "i") }, { email: new RegExp(safeSearch, "i") }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  return sendSuccess(res, { data: { users }, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const updateUserRole = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot change your own role." });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  return sendSuccess(res, { message: "User role updated.", data: { user } });
});

const setUserActive = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  return sendSuccess(res, { message: "User account updated.", data: { user } });
});

const listAllProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find().populate("owner", "name email").sort({ createdAt: -1 });
  return sendSuccess(res, { data: { properties } });
});

const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalTenants, totalOwners, totalProperties, availableProperties, totalInquiries] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tenant" }),
      User.countDocuments({ role: "owner" }),
      Property.countDocuments(),
      Property.countDocuments({ available: true }),
      Inquiry.countDocuments()
    ]);
  return sendSuccess(res, {
    data: {
      stats: { totalUsers, totalTenants, totalOwners, totalProperties, availableProperties, totalInquiries }
    }
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account." });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  const properties = await Property.find({ owner: user.id }).select("_id");
  const propertyIds = properties.map((property) => property.id);
  await Promise.all([
    Property.deleteMany({ owner: user.id }),
    Favorite.deleteMany({ $or: [{ user: user.id }, { property: { $in: propertyIds } }] }),
    Inquiry.deleteMany({ $or: [{ tenant: user.id }, { owner: user.id }, { property: { $in: propertyIds } }] }),
    user.deleteOne()
  ]);
  return sendSuccess(res, { message: "User account deleted.", data: { userId: user.id } });
});

const updateAnyProperty = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.available !== undefined) updates.available = req.body.available;
  const property = await Property.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  return sendSuccess(res, { message: "Property updated.", data: { property } });
});

const deleteAnyProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).json({ success: false, message: "Property not found." });
  await Promise.all([Favorite.deleteMany({ property: property.id }), Inquiry.deleteMany({ property: property.id })]);
  return sendSuccess(res, { message: "Property removed.", data: { propertyId: property.id } });
});

module.exports = {
  listUsers,
  updateUserRole,
  setUserActive,
  listAllProperties,
  getStats,
  deleteUser,
  updateAnyProperty,
  deleteAnyProperty
};
