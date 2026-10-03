const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

const createInquiry = asyncHandler(async (req, res) => {
  const propertyId = req.params.propertyId || req.body.property;
  const property = await Property.findById(propertyId);
  if (!property || !property.available) {
    return res.status(404).json({ success: false, message: "Available property not found." });
  }
  if (property.owner.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot inquire about your own property." });
  }
  const inquiry = await Inquiry.create({
    tenant: req.user.id,
    owner: property.owner,
    property: property.id,
    message: req.body.message,
    phone: req.body.phone || req.user.phone
  });
  return sendSuccess(res, { statusCode: 201, message: "Inquiry sent to the property owner.", data: { inquiry } });
});

const listInquiries = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { [req.user.role === "owner" ? "owner" : "tenant"]: req.user.id };
  if (req.query.status) filter.status = req.query.status;
  const inquiries = await Inquiry.find(filter)
    .populate("tenant", "name email phone")
    .populate("owner", "name email phone")
    .populate("property", "title rent address city locality images available")
    .sort({ createdAt: -1 });
  return sendSuccess(res, { data: { inquiries } });
});

const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found." });
  if (req.user.role !== "admin" && inquiry.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Only the property owner can respond to this inquiry." });
  }
  if (req.body.status !== undefined) inquiry.status = req.body.status;
  if (req.body.ownerResponse !== undefined) {
    inquiry.ownerResponse = req.body.ownerResponse;
    if (inquiry.status === "pending") inquiry.status = "responded";
  }
  await inquiry.save();
  return sendSuccess(res, { message: "Inquiry updated.", data: { inquiry } });
});

module.exports = { createInquiry, listInquiries, updateInquiry };
