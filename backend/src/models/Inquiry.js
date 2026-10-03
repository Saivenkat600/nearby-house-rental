const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, minlength: 5, maxlength: 2000 },
    phone: { type: String, trim: true, maxlength: 30 },
    status: { type: String, enum: ["pending", "contacted", "responded", "closed"], default: "pending" },
    ownerResponse: { type: String, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

inquirySchema.index({ tenant: 1, property: 1 });
inquirySchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
