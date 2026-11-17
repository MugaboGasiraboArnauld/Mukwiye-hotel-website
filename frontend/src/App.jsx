import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Rooms from "./pages/Rooms.jsx";
import RoomDetail from "./pages/RoomDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Admin from "./pages/Admin.jsx";
import Requests from "./pages/Requests.jsx";
import Notifications from "./pages/Notifications.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
