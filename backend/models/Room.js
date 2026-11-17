const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "Standard", trim: true },
    price: { type: Number, required: true, min: 0 },
    monthlyPrice: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    size: { type: String, default: "" },
    bed: { type: String, default: "" },
    description: { type: String, default: "" },
    amenities: { type: [String], default: [] },
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    booked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Room", roomSchema);
