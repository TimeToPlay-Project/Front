<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommonRoutes from "./Routes/CommonRoutes";
import QuizRoutes from "./Routes/QuizRoutes";
import TestRoute from "./Routes/TestRoute";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/*" element={<CommonRoutes />} />
        
        <Route path="/quiz/*" element={<QuizRoutes />} />

        <Route path="/test/*" element={<TestRoute />} />

      </Routes>
    </Router>
  );
}

export default App;
=======
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CommonRoutes from "./Routes/CommonRoutes";
import QuizRoutes from "./Routes/QuizRoutes";
import TestRoute from "./Routes/TestRoute";


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/*" element={<CommonRoutes />} />
        
        <Route path="/quiz/*" element={<QuizRoutes />} />

        <Route path="/test/*" element={<TestRoute />} />

      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> 1db3dfa4f2ddfde8fee81c4d870dfc338aa90978
