// src/pages/MyProjectsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import { listWorkspaces, deleteWorkspace } from "../api/workspaces";

// 백엔드에 아무 데이터도 없을 때 보여줄 데모 카드들

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]); // 실제 워크스페이스 리스트
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null); // 삭제 중인 카드 표시용

  // 새 프로젝트 생성 → 워크스페이스로 이동
  const handleCreateNew = () => {
    navigate("/workspace");
  };

  // 특정 워크스페이스 열기
  const handleOpenProject = (workspaceId) => {
    navigate(`/workspace?workspaceId=${workspaceId}`);
  };

  // 🗑 워크스페이스 삭제
  const handleDeleteProject = async (workspaceId) => {
    const target = projects.find((p) => p.id === workspaceId);
    const confirmMsg = target
      ? `정말 "${target.title}" 프로젝트를 삭제할까요?\n(생성된 영상도 함께 삭제될 수 있습니다.)`
      : "정말 이 프로젝트를 삭제할까요?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(workspaceId);
      await deleteWorkspace(workspaceId); // ✅ DELETE /api/v1/workspaces/{id}
      // 프론트 상태에서도 제거
      setProjects((prev) => prev.filter((p) => p.id !== workspaceId));
    } catch (e) {
      console.error("Failed to delete workspace", e);
      alert("프로젝트 삭제에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  };

  // 마운트 시 내 워크스페이스 목록 조회
  useEffect(() => {
    let cancelled = false;

    async function fetchProjects() {
      try {
        setLoading(true);
        const list = await listWorkspaces(); // [{id, title, status, videoUrl, ...}, ...]

        if (cancelled) return;

        // 카드에서 사용할 최소 정보만 추려서 매핑
        const mapped = list.map((w) => ({
          id: w.id,
          title: w.title,
          videoUrl: w.videoUrl, // ✅ 백엔드에서 온 videoUrl
          thumbnail: "/projects/default.png", // videoUrl 없을 때 쓸 기본 이미지
          status: w.status,
        }));

        setProjects(mapped);
      } catch (e) {
        console.error("Failed to fetch workspaces", e);
        if (!cancelled) {
          setError("워크스페이스 목록을 불러오는 데 실패했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, []);

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

          {/* 로딩/에러 표시 */}
          {loading && (
            <div className="col-span-full flex items-center justify-center text-sm text-gray-500">
              워크스페이스를 불러오는 중입니다...
            </div>
          )}

          {!loading && error && (
            <div className="col-span-full flex items-center justify-center text-sm text-red-500">
              {error}
            </div>
          )}

          {/* 실제 워크스페이스 카드들 */}
          {!loading &&
            projects.map((p) => (
              <ProjectCard
                key={p.id}
                title={p.title}
                thumbnail={p.thumbnail}
                videoUrl={p.videoUrl}
                subtitle={
                  p.status
                    ? `Status: ${p.status}${
                        deletingId === p.id ? " (삭제 중...)" : ""
                      }`
                    : deletingId === p.id
                    ? "삭제 중..."
                    : undefined
                }
                onClick={() => handleOpenProject(p.id)}
                onDelete={() => handleDeleteProject(p.id)} // ✅ 삭제 연결
              />
            ))}

          {/* 백엔드에서 가져온 프로젝트가 없으면, 기존 더미 카드 보여주기 */}
          {!loading &&
            !error &&
            projects.length === 0 &&
            MOCK_PROJECTS.map((p) => (
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
