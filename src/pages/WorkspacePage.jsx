import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";

export default function WorkspacePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const openPicker = () => document.getElementById("pdf-input")?.click();

  const handleFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("PDF만 업로드하세요.");
      return;
    }
    setFileName(file.name);
    // TODO: 여기서 업로드/파싱 로직 호출
    // uploadPDF(file)
  }, []);

  const onInputChange = (e) => handleFiles(e.target.files);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
    {/* ✅ 진짜 Navbar로 교체 (로고 클릭 시 홈으로 이동 + Workspace 텍스트 표시) */}
    <Navbar showAuthButtons={false} subtitle="Workspace" />
      

      <main className="px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ==== 업로드 존 (전체 클릭 + DnD) ==== */}
          <div
            onClick={openPicker}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={[
              "rounded-xl bg-white p-8 flex flex-col items-center justify-center gap-4 transition cursor-pointer",
              "border-2 border-dashed",
              isDragging ? "border-[#8B5CF6] bg-purple-50 shadow-inner" : "border-purple-300"
            ].join(" ")}
            role="button"
            aria-label="Upload PDF"
          >
            <img src="/Upload.svg" alt="Upload" className="w-12 h-12 object-contain" />
            <p className="text-xl font-semibold text-black">
              {fileName ? fileName : "Drop your PDF here"}
            </p>

            <img src="/SelectFile.svg" alt="Select file" className="w-[130px] h-auto" />

            {/* 숨김 파일 입력 */}
            <input
              id="pdf-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          {/* 우측 패널 */}
          <div className="rounded-xl border bg-white p-8 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="mb-3">Upload a document to start creating</p>
              <div className="text-2xl">🎬</div>
            </div>
          </div>

          {/* 채팅 패널 */}
          <div className="rounded-xl border bg-white p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Upload a document to start chatting
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Type a message..." />
                <button className="p-2 rounded-full bg-[#6B4CF6] text-white">↑</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-8 flex items-center justify-center text-gray-300">
            (Reserved)
          </div>
        </div>
      </main>
    </div>
  );
}
