require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("../models/Room");
const seedRooms = require("../seed/rooms");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mukwiye_hotel";

async function run() {
  await mongoose.connect(MONGODB_URI);
  let created = 0;
  for (const room of seedRooms) {
    const exists = await Room.findOne({ name: room.name });
    if (!exists) {
      await Room.create({ ...room, booked: false });
      created += 1;
    }
  }
  console.log(`Added ${created} new available room(s).`);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
