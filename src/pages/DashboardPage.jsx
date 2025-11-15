// src/pages/DashboardPage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../state/auth";
import { MOCK_PROJECTS } from "../mock/projects";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 로그인 안 되어 있으면 안내만
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5FF]">
        <Navbar />
        <main className="max-w-4xl mx-auto pt-24">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">
            대시보드를 보려면 로그인이 필요합니다.
            우측 상단의 <b>Log In</b> 버튼을 눌러 먼저 로그인해 주세요.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5FF]">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12">
        <header className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-gray-500 text-sm mt-1">
              이전에 작업하던 프로젝트들을 한 번에 확인할 수 있어요.
            </p>
          </div>
          <button
            onClick={() => navigate("/workspace")}
            className="px-4 py-2 rounded-xl border border-dashed border-[#A855F7] text-[#7C3AED] font-medium hover:bg-[#F5F3FF] transition"
          >
            + Create New Project
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {MOCK_PROJECTS.map((p) => (
            <button
              key={p.id}
              className="text-left bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition"
              onClick={() => {
                // 나중에 진짜로는 프로젝트/세션 id 넘겨서 열면 됨
                navigate("/workspace");
              }}
            >
              <h2 className="font-semibold mb-1 truncate">{p.title}</h2>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {p.description}
              </p>
              <span className="text-[11px] text-gray-400">
                Last updated · {p.updatedAt}
              </span>
            </button>
          ))}

          {MOCK_PROJECTS.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-sm py-10">
              아직 생성된 프로젝트가 없습니다. 새 프로젝트를 만들어 보세요.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
