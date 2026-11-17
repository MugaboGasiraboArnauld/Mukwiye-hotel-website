require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const apiRouter = require("./routes");
const Room = require("./models/Room");
const seedRooms = require("./seed/rooms");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mukwiye_hotel";

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mukwiye-hotel-api" });
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.message && err.message.includes("image")) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);

    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(seedRooms);
      console.log(`Seeded ${seedRooms.length} rooms`);
    } else {
      let created = 0;
      for (const room of seedRooms) {
        const exists = await Room.findOne({ name: room.name });
        if (!exists) {
          await Room.create({ ...room, booked: false });
          created += 1;
        }
      }
      if (created) console.log(`Added ${created} missing room(s)`);
    }

    app.listen(PORT, () => {
      console.log(`Hotel API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
