import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import "./chatbot.css";

export default function ChatApp() {
  return (
    <Routes>
      <Route index element={<ChatPage />} />
    </Routes>
  );
}
