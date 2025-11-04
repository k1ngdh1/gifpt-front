import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MyProjectsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} />

      <main className="p-10">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">My Projects</h2>
        <p className="text-gray-500 mb-10">
          Create new projects or continue working on existing ones
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* ✅ 클릭하면 /workspace 로 이동 */}
          <button
            onClick={() => navigate("/workspace")}
            className="border-2 border-dashed border-purple-400 rounded-xl p-10 text-center hover:bg-purple-50 transition focus:outline-none"
          >
            <div className="text-5xl text-purple-500 mb-4">＋</div>
            <h3 className="font-bold text-lg">Create New Project</h3>
            <p className="text-sm text-gray-500">
              Upload a PDF and generate a new video
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
