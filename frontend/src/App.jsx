import { Routes, Route } from "react-router-dom";
import EventList from "./components/EventList.jsx";
import EventDetail from "./components/EventDetail.jsx";
import EventForm from "./components/EventForm.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventList />} />
      <Route path="/events/new" element={<EventForm />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/events/:id/edit" element={<EventForm />} />
    </Routes>
  );
}
