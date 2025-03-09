const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    popularLandmark: { type: String, trim: true },
    bestTimeToVisit: { type: String, trim: true },
    weatherInfo: { type: String },
    currency: { type: String, trim: true },
    timeZone: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", LocationSchema);
