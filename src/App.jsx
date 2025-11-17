import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import WorkspacePage from "./pages/WorkspacePage";
import { useEffect } from "react";
import { http } from "./lib/http";



export default function App() {
  useEffect(() => {
    http.get("/healthz")
      .then(() => console.log("✅ backend 연결 성공"))
      .catch((e) => console.error("❌ 연결 실패", e.message));
  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<MyProjectsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
      </Routes>
    </Router>
  );
}
