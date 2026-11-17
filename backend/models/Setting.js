const mongoose = require("mongoose");

const galleryPhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { _id: false }
);

const guestVideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String, default: "" },
    type: { type: String, enum: ["upload", "embed"], default: "upload" },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site", unique: true },
    heroImage: { type: String, default: "" },
    gardenImage: { type: String, default: "" },
    hotelPhotos: { type: [galleryPhotoSchema], default: [] },
    guestVideos: { type: [guestVideoSchema], default: [] },
    mapEmbedUrl: { type: String, default: "" },
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

module.exports = mongoose.model("Setting", settingSchema);
