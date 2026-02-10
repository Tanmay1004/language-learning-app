import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import DashboardLayoutShell from "./DashboardLayout";

// 📄 Pages (flat)
import Dashboard from "./pages/dashboard/Dashboard";
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUs";
import FAQPage from "./pages/FAQPage";
import Badges from "./pages/Badges";

// 🧠 Learning modules
import PronunciationPage from "../modules/pronunciation/PronunciationPage";
import QuizApp from "../modules/quiz/QuizApp";
import ChatApp from "../modules/chatbot/ChatApp";

import { ToastContainer } from "react-toastify";
import XPOverlay from "../shared/xp/XPOverlay";
import "../shared/xp/xp.css";

import { auth } from "../auth/firebase";
import { syncXPBidirectional } from "../shared/xp/xp";

export default function App() {
  const [streak, setStreak] = useState(0);

  // ---------------------------------------
  // Initial sync after Firebase auth
  // ---------------------------------------
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const data = await syncXPBidirectional();
        if (data?.streak != null) {
          setStreak(data.streak);
        }
      } catch (err) {
        console.error("XP sync failed:", err);
      }
    });

    return () => unsub();
  }, []);

  // ---------------------------------------
  // Live streak updates
  // ---------------------------------------
  useEffect(() => {
    function onStreakChanged(e) {
      if (typeof e.detail === "number") {
        setStreak(e.detail);
      }
    }

    window.addEventListener("streak:changed", onStreakChanged);
    return () =>
      window.removeEventListener("streak:changed", onStreakChanged);
  }, []);

  return (
    <>
      {/* GLOBAL XP ANIMATIONS */}
      <XPOverlay />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        theme="dark"
      />

      <Routes>
        <Route element={<DashboardLayoutShell streak={streak} />}>
          {/* Default */}
          <Route path="/" element={<Navigate to="/homepage" />} />

          {/* Static pages */}
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about-us" element={<AboutUs />} />

          {/* Learning modules */}
          <Route path="/pronunciation" element={<PronunciationPage />} />
          <Route path="/quiz/*" element={<QuizApp />} />
          <Route path="/chat/*" element={<ChatApp />} />
        </Route>
      </Routes>
    </>
  );
}
