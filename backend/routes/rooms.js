const express = require("express");
const fs = require("fs");
const path = require("path");
const Room = require("../models/Room");
const upload = require("../middleware/upload");
const asyncHandler = require("../lib/asyncHandler");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");
const roomUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

function removeUploadedFile(file) {
  if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
}

function removeStoredFile(publicPath) {
  if (publicPath && publicPath.startsWith("/uploads/")) {
    const filePath = path.join(uploadsDir, path.basename(publicPath));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

function filesFrom(req) {
  return {
    image: req.files?.image?.[0] || null,
    video: req.files?.video?.[0] || null,
  };
}

function normalizeAmenities(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rooms = await Room.find().sort({ createdAt: 1 });
    res.json(rooms);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  })
);

router.post(
  "/",
  roomUpload,
  asyncHandler(async (req, res) => {
    const { image, video } = filesFrom(req);
    const { name, price, capacity } = req.body;
    if (!name || !price || !capacity) {
      removeUploadedFile(image);
      removeUploadedFile(video);
      return res
        .status(400)
        .json({ message: "name, price and capacity are required" });
    }

    const room = await Room.create({
      name,
      type: req.body.type || "Standard",
      price: Number(price),
      monthlyPrice: req.body.monthlyPrice ? Number(req.body.monthlyPrice) : 0,
      capacity: Number(capacity),
      size: req.body.size || "",
      bed: req.body.bed || "",
      description: req.body.description || "",
      amenities: normalizeAmenities(req.body.amenities),
      image: image ? `/uploads/${image.filename}` : "",
      video: video ? `/uploads/${video.filename}` : "",
      booked: req.body.booked === "true" || req.body.booked === true,
    });

    res.status(201).json(room);
  })
);

router.put(
  "/:id",
  roomUpload,
  asyncHandler(async (req, res) => {
    const { image, video } = filesFrom(req);
    const room = await Room.findById(req.params.id);
    if (!room) {
      removeUploadedFile(image);
      removeUploadedFile(video);
      return res.status(404).json({ message: "Room not found" });
    }

    if (req.body.name !== undefined) room.name = req.body.name;
    if (req.body.type !== undefined) room.type = req.body.type;
    if (req.body.price !== undefined) room.price = Number(req.body.price);
    if (req.body.monthlyPrice !== undefined)
      room.monthlyPrice = Number(req.body.monthlyPrice);
    if (req.body.capacity !== undefined)
      room.capacity = Number(req.body.capacity);
    if (req.body.size !== undefined) room.size = req.body.size;
    if (req.body.bed !== undefined) room.bed = req.body.bed;
    if (req.body.description !== undefined)
      room.description = req.body.description;
    if (req.body.amenities !== undefined)
      room.amenities = normalizeAmenities(req.body.amenities);
    if (req.body.booked !== undefined)
      room.booked = req.body.booked === "true" || req.body.booked === true;

    if (image) {
      removeStoredFile(room.image);
      room.image = `/uploads/${image.filename}`;
    }

    if (video) {
      removeStoredFile(room.video);
      room.video = `/uploads/${video.filename}`;
    } else if (req.body.removeVideo === "true") {
      removeStoredFile(room.video);
      room.video = "";
    }

    await room.save();
    res.json(room);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    removeStoredFile(room.image);
    removeStoredFile(room.video);

    res.json({ message: "Room deleted", room });
  })
);

module.exports = router;
