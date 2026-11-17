# Mukwiye Hotel & Suites

A full-stack hotel room booking website.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Uploads:** Room photos uploaded with Multer and stored in `backend/uploads`

## Features

- Browse rooms and suites
- Filter rooms by type and price
- Check availability by dates and guests
- Book a room with guest details
- View and cancel bookings
- Manager page to add rooms, upload photos and replace existing photos

## Getting started

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The API runs on `http://localhost:5001`.

Requirements: Node.js 18+ and MongoDB running on `mongodb://localhost:27017`.
Change `MONGODB_URI` in `backend/.env` if your database is elsewhere.

The first time the server starts, it seeds six sample rooms if the database is empty.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The site runs on `http://localhost:5174`.

### 3. Upload room photos

Open `http://localhost:5174/admin`, fill in the room form and select a photo.
You can also click **Replace photo** on any existing room.

## API

| Method | Endpoint            | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/api/rooms`        | List rooms                      |
| GET    | `/api/rooms/:id`    | Get one room                    |
| POST   | `/api/rooms`        | Create a room (multipart, `image`) |
| PUT    | `/api/rooms/:id`    | Update a room / replace photo   |
| DELETE | `/api/rooms/:id`    | Delete a room                   |
| GET    | `/api/bookings`     | List bookings                   |
| POST   | `/api/bookings`     | Create a booking                |
| DELETE | `/api/bookings/:id` | Cancel a booking                |
