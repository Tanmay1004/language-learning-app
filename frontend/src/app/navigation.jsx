import React from "react";

import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";

import MicIcon from "@mui/icons-material/Mic";
import QuizIcon from "@mui/icons-material/BarChart";
import ChatIcon from "@mui/icons-material/Chat";

import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import InfoIcon from "@mui/icons-material/Info";

export const NAVIGATION = [
  // =========================
  // MAIN
  // =========================
  {
    kind: "header",
    title: "Main",
  },
  {
    segment: "homepage",
    title: "Home",
    icon: <HomeIcon />,
  },
  {
    segment: "dashboard",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "badges",
    title: "Achievements",
    icon: <LocalPoliceIcon />,
  },

  {
    kind: "divider",
  },

  // =========================
  // LEARNING
  // =========================
  {
    kind: "header",
    title: "Learning",
  },
  {
    segment: "pronunciation",
    title: "Pronunciation",
    icon: <MicIcon />,
  },
  {
    segment: "quiz",
    title: "Quizzes",
    icon: <QuizIcon />,
  },
  {
    segment: "chat",
    title: "Practice Chat",
    icon: <ChatIcon />,
  },

  {
    kind: "divider",
  },

  // =========================
  // SUPPORT
  // =========================
  {
    kind: "header",
    title: "Support",
  },
  {
    segment: "faq",
    title: "Help Center",
    icon: <LiveHelpIcon />,
  },
  {
    segment: "about-us",
    title: "About",
    icon: <InfoIcon />,
  },
];