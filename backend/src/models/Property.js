const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 5, maxlength: 5000 },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    address: { type: String, required: true, trim: true, maxlength: 250 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    locality: { type: String, trim: true, maxlength: 100 },
    bhk: { type: Number, required: true, min: 0, max: 30 },
    bedrooms: { type: Number, min: 0, max: 30 },
    bathrooms: { type: Number, min: 0, max: 30 },
    propertyType: {
      type: String,
      enum: ["Apartment", "House", "Villa", "PG", "Room", "Studio", "Other"],
      default: "Apartment"
    },
    furnishing: {
      type: String,
      enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
      default: "Unfurnished"
    },
    amenities: [{ type: String, trim: true, maxlength: 60 }],
    images: [{ type: String, trim: true, maxlength: 2048 }],
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    availableFrom: { type: Date, default: Date.now },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates) =>
            coordinates.length === 2 &&
            coordinates[0] >= -180 &&
            coordinates[0] <= 180 &&
            coordinates[1] >= -90 &&
            coordinates[1] <= 90,
          message: "Location coordinates must be [longitude, latitude]."
        }
      }
    },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

propertySchema.pre("validate", function normalizeLocationAndBedrooms() {
  if (Number.isFinite(this.longitude) && Number.isFinite(this.latitude)) {
    this.location = { type: "Point", coordinates: [this.longitude, this.latitude] };
  } else if (this.location && this.location.type === "Point" && this.location.coordinates?.length === 2) {
    this.longitude = this.location.coordinates[0];
    this.latitude = this.location.coordinates[1];
  }
  if (this.bhk === undefined && this.bedrooms !== undefined) this.bhk = this.bedrooms;
  if (this.bedrooms === undefined && this.bhk !== undefined) this.bedrooms = this.bhk;
});

propertySchema.index({ location: "2dsphere" });
propertySchema.index({ city: 1, rent: 1, bhk: 1, available: 1 });
propertySchema.index({ title: "text", description: "text", city: "text", locality: "text", address: "text" });

module.exports = mongoose.model("Property", propertySchema);
