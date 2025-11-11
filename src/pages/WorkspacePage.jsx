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
    // TODO: 업로드 처리
  }, []);

  const onInputChange = (e) => handleFiles(e.target.files);
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDrop      = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} subtitle="Workspace" />

      <main className="max-w-[1200px] mx-auto px-6 pb-12">
        {/* 3열 그리드: 좌측 2열(위/아래), 우측 1열(2행 합침) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

          {/* 좌상단 */}
          <div className="lg:col-span-1 lg:-ml-2">
            <div
              onClick={openPicker}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              role="button"
              aria-label="Upload PDF"
              className={[
                "rounded-2xl bg-white px-8 py-6 cursor-pointer transition",
                "flex items-center justify-center",
                "border-2 border-dashed",
                "shadow-[0_6px_18px_rgba(0,0,0,0.06)]",
                isDragging ? "border-[#9D6BFF] bg-purple-50" : "border-[#D9C6FF]"
              ].join(" ")}
              style={{ minHeight: 180 }} 
            >
              {/*가운데에 놓일 가로 레이아웃 */}
              <div className="flex items-center gap-4">
                <img src="/Upload.svg" alt="Upload" className="w-10 h-10" />
                <div>
                  <p className="text-[20px] font-semibold text-[#111] leading-tight">
                    {fileName || "Drop your PDF here"}
                  </p>
                  <div className="mt-2">
                    <img src="/SelectFile.svg" alt="Select file" className="h-8" />
                  </div>
                </div>
              </div>

              <input
                id="pdf-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onInputChange}
              />
            </div>
          </div>

          {/* ▸ 우측: 상/하 합친 큰 패널 */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl bg-white p-8 text-gray-400 shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] min-h-[520px]">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="mb-3 text-[18px] text-[#8B8E99]">
                  Upload a document<br/>to start creating
                </p>
                <div className="text-2xl">🎬</div>
              </div>
            </div>
          </div>

          {/* ▸ 좌하단: 채팅(크게) */}
          <div className="lg:col-span-1 lg:-ml-2 rounded-2xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE]">
            <div className="h-[360px] flex items-center justify-center text-[#8B8E99]">
              Upload a document to start chatting
            </div>
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-3 outline-none"
                  placeholder="Type a message..."
                />
                <button className="min-w-10 min-h-10 grid place-items-center rounded-full bg-[#6B4CF6] text-white">
                  ↑
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
