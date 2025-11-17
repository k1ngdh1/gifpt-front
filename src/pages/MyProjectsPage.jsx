// src/pages/ProjectsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";

// 임시 더미 데이터 (나중에 백엔드 연동 시 교체)
const MOCK_PROJECTS = [
  {
    id: "linear-search",
    title: "Linear Search",
    thumbnail: "/projects/linear-search.png",
  },
  {
    id: "binary-search-tree",
    title: "Binary Search Tree",
    thumbnail: "/projects/bst.png",
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    thumbnail: "/projects/bubble-sort.png",
  },
  {
    id: "dijkstra",
    title: "Dijkstra’s Algorithm",
    thumbnail: "/projects/dijkstra.png",
  },
  // 필요하면 더 추가
];

export default function ProjectsPage() {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    // 새 프로젝트 생성 → 워크스페이스로 이동
    navigate("/workspace");
  };

  const handleOpenProject = (projectId) => {
    // 나중에 실제 프로젝트 상세 경로로 변경하면 됨
    // 예: navigate(`/workspace/${projectId}`);
    navigate(`/workspace?project=${projectId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} subtitle="My Projects" />

      <main className="max-w-[1200px] mx-auto px-6 pb-16">
        {/* 헤더 텍스트 */}
        <header className="mt-10 mb-8">
          <h1 className="text-[40px] md:text-[44px] font-extrabold text-[#4C1D95]">
            My Projects
          </h1>
          <p className="mt-2 text-[18px] text-[#6B7280]">
            Create new projects or continue working on existing ones
          </p>
        </header>

        {/* 카드 그리드 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Create New Project 카드 */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="
              flex flex-col items-center justify-center
              h-[260px] w-full
              rounded-2xl bg-white
              border-2 border-dashed border-[#C4A5FF]
              hover:border-[#8B5CF6]
              shadow-[0_10px_25px_rgba(0,0,0,0.04)]
              hover:shadow-[0_18px_35px_rgba(0,0,0,0.10)]
              transition-colors transition-shadow transition-transform
              hover:-translate-y-1
              text-center px-6
            "
          >
            {/* 플러스 원형 아이콘 */}
            <div
              className="
                mb-4
                w-[80px] h-[80px]
                rounded-full
                bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6]
                flex items-center justify-center
                text-white text-4xl
                shadow-[0_10px_25px_rgba(59,130,246,0.4)]
              "
            >
              +
            </div>
            <div className="text-[18px] font-semibold text-[#111827]">
              Create New Project
            </div>
            <div className="mt-2 text-[14px] text-[#6B7280] leading-relaxed">
              Upload a PDF and generate a new video
            </div>
          </button>

          {/* 기존 프로젝트 카드들 */}
          {MOCK_PROJECTS.map((p) => (
            <ProjectCard
              key={p.id}
              title={p.title}
              thumbnail={p.thumbnail}
              onClick={() => handleOpenProject(p.id)}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
