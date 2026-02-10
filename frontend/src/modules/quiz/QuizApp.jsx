import { Routes, Route } from "react-router-dom";
import LearnPage from "./pages/LearnPage";
import SectionPage from "./pages/SectionPage";
import QuizPage from "./pages/QuizPage";
import ResultsPage from "./pages/ResultsPage";
import "./global.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";

export default function QuizApp() {
  return (
    <div className="quiz-root">
      <Routes>
        <Route index element={<LearnPage />} />
        <Route path="section/:sectionId" element={<SectionPage />} />
        <Route path="unit/:unitId/quiz" element={<QuizPage />} />
        <Route path="results/:attemptId" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}
