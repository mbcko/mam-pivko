import { Navigate, Routes, Route } from "react-router-dom";
import EventList from "./components/EventList.jsx";
import EventDetail from "./components/EventDetail.jsx";
import EventForm from "./components/EventForm.jsx";
import WishlistPage from "./components/WishlistPage.jsx";
import { AppShell, PreferencesProvider } from "./design/Design.jsx";

export default function App() {
  return (
    <PreferencesProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/new" element={<EventForm />} />
          <Route path="/events/new" element={<Navigate to="/new" replace />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/edit" element={<EventForm />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </PreferencesProvider>
  );
}
