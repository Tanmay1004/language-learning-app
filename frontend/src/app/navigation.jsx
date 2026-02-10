import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import HomeIcon from '@mui/icons-material/Home';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import InfoIcon from '@mui/icons-material/Info';

export const NAVIGATION = [
  {
    kind: 'header',
    title: 'Personal',
  },
  {
    segment: 'homepage',
    title: 'Home',
    icon: <HomeIcon />,
  },
  {
    segment: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    segment: 'badges',
    title: 'Badges',
    icon: <LocalPoliceIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'Learning Options',
  },
  {
    segment: 'pronunciation',
    title: 'Pronunciation',
    icon: <MicIcon />,
  },
  {
    segment: 'quiz',
    title: 'Quiz',
    icon: <QuizIcon />,
  },
  {
    segment: 'chat',
    title: 'Conversation',
    icon: <ChatIcon />,
  },
  {
    kind: 'divider',
  },
  {
    kind: 'header',
    title: 'App Info',
  },
  {
    segment: 'faq',
    title: 'FAQs',
    icon: <LiveHelpIcon />,
  },
  {
    segment: 'about-us',
    title: 'About Us',
    icon: <InfoIcon />,
  },
];
