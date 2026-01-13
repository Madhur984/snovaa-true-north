import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import ManageEvent from "./pages/ManageEvent";
import MyEvents from "./pages/MyEvents";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import CreateClub from "./pages/CreateClub";
import CheckIn from "./pages/CheckIn";
import SponsorDashboard from "./pages/SponsorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Map from "./pages/Map";
import Philosophy from "./pages/Philosophy";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/manage" element={<ManageEvent />} />
          <Route path="/events/:id/checkin" element={<CheckIn />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/create" element={<CreateClub />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/sponsor" element={<SponsorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/philosophy" element={<Philosophy />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
