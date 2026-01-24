import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import CreateEvent from "@/pages/CreateEvent";
import ManageEvent from "@/pages/ManageEvent";
import MyEvents from "@/pages/MyEvents";
import Clubs from "@/pages/Clubs";
import ClubDetail from "@/pages/ClubDetail";
import CreateClub from "@/pages/CreateClub";
import CheckIn from "@/pages/CheckIn";
import SponsorDashboard from "@/pages/SponsorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Map from "@/pages/Map";
import Philosophy from "@/pages/Philosophy";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import ClubDashboard from "@/components/clubs/ClubDashboard";
import ClubLayout from "@/components/clubs/ClubLayout";
import ClubEvents from "@/components/clubs/ClubEvents";
import ClubMembers from "@/components/clubs/ClubMembers";
import ClubChat from "@/components/clubs/ClubChat";
import ClubBroadcast from "@/components/clubs/ClubBroadcast";
import ClubSettings from "@/components/clubs/ClubSettings";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/events/create" element={<PageTransition><CreateEvent /></PageTransition>} />
        <Route path="/events/:id" element={<PageTransition><EventDetail /></PageTransition>} />
        <Route path="/events/:id/manage" element={<PageTransition><ManageEvent /></PageTransition>} />
        <Route path="/events/:id/checkin" element={<PageTransition><CheckIn /></PageTransition>} />
        <Route path="/my-events" element={<PageTransition><MyEvents /></PageTransition>} />
        <Route path="/clubs" element={<PageTransition><Clubs /></PageTransition>} />
        <Route path="/clubs/create" element={<PageTransition><CreateClub /></PageTransition>} />
        <Route path="/clubs/:id" element={<PageTransition><ClubDetail /></PageTransition>} />
        <Route path="/clubs/:id/dashboard" element={<PageTransition><ClubLayout><ClubDashboard /></ClubLayout></PageTransition>} />
        <Route path="/clubs/:id/events" element={<PageTransition><ClubLayout><ClubEvents /></ClubLayout></PageTransition>} />
        <Route path="/clubs/:id/members" element={<PageTransition><ClubLayout><ClubMembers /></ClubLayout></PageTransition>} />
        <Route path="/clubs/:id/chat" element={<PageTransition><ClubLayout><ClubChat /></ClubLayout></PageTransition>} />
        <Route path="/clubs/:id/broadcast" element={<PageTransition><ClubLayout><ClubBroadcast /></ClubLayout></PageTransition>} />
        <Route path="/clubs/:id/settings" element={<PageTransition><ClubLayout><ClubSettings /></ClubLayout></PageTransition>} />
        <Route path="/sponsor" element={<PageTransition><SponsorDashboard /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/map" element={<PageTransition><Map /></PageTransition>} />
        <Route path="/philosophy" element={<PageTransition><Philosophy /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
