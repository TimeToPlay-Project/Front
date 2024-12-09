import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommonRoutes from "./Routes/CommonRoutes";
import QuizRoutes from "./Routes/QuizRoutes";
import TestRoute from "./Routes/TestRoute";
import TournamentRoute from "./Routes/TournamentRoute";
import EditorRoutes from "./Routes/EditorRoutes";
import { AuthProvider } from "./AuthContext";
import LiarRoutes from "./Routes/LiarRoutes";
import SpeedQuizRoutes from "./Routes/SpeedQuizRoutes";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/*" element={<CommonRoutes />} />
          
          <Route path="/quiz/*" element={<QuizRoutes />} />

          <Route path="/test/*" element={<TestRoute />} />

          <Route path="/tournament/*" element={<TournamentRoute />} />

          <Route path="/editor/*" element={<EditorRoutes />} />

          <Route path="/liar/*" element={<LiarRoutes />} />

          <Route path="/speedQuiz/*" element={<SpeedQuizRoutes />} />


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
