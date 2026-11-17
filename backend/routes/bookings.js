const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const asyncHandler = require("../lib/asyncHandler");
const { notifyBookingCreated, notifyBookingUpdated, notifyLinks, recordGuestNotifications } = require("../lib/notify");

const router = express.Router();

function nightsBetween(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.roomId) filter.room = req.query.roomId;
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      roomId,
      guestName,
      email,
      phone,
      checkIn,
      checkOut,
      guests,
      specialRequests,
    } = req.body;

    if (!roomId || !guestName || !email || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "roomId, guestName, email, checkIn and checkOut are required",
      });
    }

    const nights = nightsBetween(checkIn, checkOut);
    if (Number.isNaN(nights) || nights <= 0) {
      return res
        .status(400)
        .json({ message: "Check-out date must be after check-in date" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.booked) {
      return res
        .status(409)
        .json({ message: "This room is currently booked" });
    }

    if (guests && Number(guests) > room.capacity) {
      return res
        .status(400)
        .json({ message: `This room allows up to ${room.capacity} guests` });
    }

    const conflict = await Booking.findOne({
      room: room.id,
      status: "confirmed",
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ message: "This room is already booked for those dates" });
    }

    const booking = await Booking.create({
      room: room.id,
      roomName: room.name,
      roomImage: room.image,
      guestName,
      email,
      phone: phone || "",
      checkIn,
      checkOut,
      guests: Number(guests) || 1,
      specialRequests: specialRequests || "",
      nights,
      total: nights * room.price,
      status: "pending",
    });

    let notifications = {};
    try {
      notifications = await notifyBookingCreated(booking);
    } catch (err) {
      console.error("notifyBookingCreated error:", err.message);
    }
    recordGuestNotifications(booking, notifications, "created");
    await booking.save();

    const payload = booking.toJSON();
    payload.notifications = notifications;
    payload.notifyLinks = notifyLinks(booking);
    res.status(201).json(payload);
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { status, managerReply } = req.body;
    const allowed = ["pending", "confirmed", "declined", "cancelled"];

    if (status !== undefined && !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (status === "confirmed") {
      const conflict = await Booking.findOne({
        _id: { $ne: booking.id },
        room: booking.room,
        status: "confirmed",
        checkIn: { $lt: booking.checkOut },
        checkOut: { $gt: booking.checkIn },
      });
      if (conflict) {
        return res.status(409).json({
          message: "This room is already booked for those dates",
        });
      }
    }

    if (status !== undefined) booking.status = status;
    if (managerReply !== undefined) booking.managerReply = managerReply;
    booking.respondedAt = new Date();

    await booking.save();

    let notifications = {};
    try {
      notifications = await notifyBookingUpdated(booking);
    } catch (err) {
      console.error("notifyBookingUpdated error:", err.message);
    }
    recordGuestNotifications(booking, notifications, "updated");
    await booking.save();

    const payload = booking.toJSON();
    payload.notifications = notifications;
    payload.notifyLinks = notifyLinks(booking);
    res.json(payload);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    let notifications = {};
    try { notifications = await notifyBookingUpdated(booking); } catch (e) { console.error(e.message); }
    booking.respondedAt = booking.respondedAt || new Date();
    recordGuestNotifications(booking, notifications, "updated");
    await booking.save();
    res.json({ message: "Booking cancelled", booking: booking.toJSON() });
  })
);

module.exports = router;
