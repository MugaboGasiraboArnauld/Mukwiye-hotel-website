const express = require("express");
const fs = require("fs");
const path = require("path");
const Setting = require("../models/Setting");
const upload = require("../middleware/upload");
const asyncHandler = require("../lib/asyncHandler");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");
const mediaUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

function removeStoredFile(publicPath) {
  if (publicPath && publicPath.startsWith("/uploads/")) {
    const filePath = path.join(uploadsDir, path.basename(publicPath));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

function removeUploadedFile(file) {
  if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
}

async function getSettings() {
  let settings = await Setting.findOne({ key: "site" });
  if (!settings) settings = await Setting.create({ key: "site" });
  return settings;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await getSettings());
  })
);

router.put(
  "/",
  mediaUpload,
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    const image = req.files?.image?.[0] || null;
    const video = req.files?.video?.[0] || null;
    const { target, caption, title, embedUrl, mapEmbedUrl, removePhotoUrl, removeVideoUrl } = req.body;

    if (mapEmbedUrl !== undefined) settings.mapEmbedUrl = String(mapEmbedUrl || "").trim();

    if (target === "hero" || target === "garden") {
      if (!image) {
        removeUploadedFile(video);
        return res.status(400).json({ message: "An image file is required" });
      }
      const field = target === "garden" ? "gardenImage" : "heroImage";
      removeStoredFile(settings[field]);
      settings[field] = `/uploads/${image.filename}`;
    } else if (target === "hotelPhoto") {
      if (!image) {
        removeUploadedFile(video);
        return res.status(400).json({ message: "An image file is required" });
      }
      settings.hotelPhotos.push({ url: `/uploads/${image.filename}`, caption: caption || "" });
    } else if (target === "guestVideo") {
      if (video) {
        settings.guestVideos.push({ url: `/uploads/${video.filename}`, title: title || "", type: "upload" });
      } else if (embedUrl) {
        settings.guestVideos.push({ url: String(embedUrl).trim(), title: title || "", type: "embed" });
      } else {
        return res.status(400).json({ message: "A video file or embed URL is required" });
      }
    } else if (removePhotoUrl) {
      const item = settings.hotelPhotos.find((p) => p.url === removePhotoUrl);
      if (item) removeStoredFile(item.url);
      settings.hotelPhotos = settings.hotelPhotos.filter((p) => p.url !== removePhotoUrl);
    } else if (removeVideoUrl) {
      const item = settings.guestVideos.find((v) => v.url === removeVideoUrl);
      if (item && item.type === "upload") removeStoredFile(item.url);
      settings.guestVideos = settings.guestVideos.filter((v) => v.url !== removeVideoUrl);
    } else if (image || video) {
      removeUploadedFile(image);
      removeUploadedFile(video);
      return res.status(400).json({ message: "A valid target is required" });
    }

    await settings.save();
    res.json(settings);
  })
);

module.exports = router;
