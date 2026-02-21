import { Navigate, Routes, Route } from "react-router-dom";
import EventList from "./components/EventList.jsx";
import EventDetail from "./components/EventDetail.jsx";
import EventForm from "./components/EventForm.jsx";
import WishlistPage from "./components/WishlistPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/events/new" element={<EventForm />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/events/:id/edit" element={<EventForm />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
