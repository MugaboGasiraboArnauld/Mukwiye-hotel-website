const express = require("express");
const roomsRouter = require("./rooms");
const bookingsRouter = require("./bookings");
const settingsRouter = require("./settings");

const router = express.Router();

router.use("/rooms", roomsRouter);
router.use("/bookings", bookingsRouter);
router.use("/settings", settingsRouter);

module.exports = router;
