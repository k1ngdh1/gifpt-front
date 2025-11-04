import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import WorkspacePage from "./pages/WorkspacePage";

export default function App() {
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
