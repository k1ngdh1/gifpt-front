// src/pages/WorkspacePage.jsx
import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { uploadFile } from "../api/file";

export default function WorkspacePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);           // ✅ 실제 파일 저장
  const [msg, setMsg] = useState("");
  const [resp, setResp] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 채팅 프롬프트 + 채팅 로그
  const [prompt, setPrompt] = useState("이 PDF에서 핵심 아이디어를 요약해줘");
  const [chatMessages, setChatMessages] = useState([]); // {role, text}[]

  const openPicker = () => document.getElementById("pdf-input")?.click();

  // PDF 선택/드롭 시: 파일만 저장
  const handleFiles = useCallback((files) => {
    const selected = files?.[0];
    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    setFile(selected);
    setFileName(selected.name);
    setMsg("파일이 선택되었습니다. 프롬프트를 입력하고 전송 버튼을 눌러주세요.");
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

  // 🔥 채팅 전송 버튼 클릭 시: 파일 + 프롬프트 같이 백엔드로
  const handleSend = async () => {
    if (!file) {
      setMsg("먼저 PDF 파일을 업로드해 주세요.");
      return;
    }
    if (!prompt.trim()) {
      setMsg("프롬프트를 입력해 주세요.");
      return;
    }

    // 채팅 로그에 유저 메시지 추가
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: prompt.trim() },
    ]);

    setUploading(true);
    setMsg("업로드 중…");
    setResp(null);

    try {
      const data = await uploadFile(file, prompt.trim()); // ✅ 파일+프롬프트 동시 전송
      setResp(data);
      setMsg(data?.message || "업로드 완료");

      // 서버 응답을 채팅 형식으로 추가
      const answerText =
        `✅ 업로드 완료\n` +
        `fileId: ${data?.fileId ?? "알 수 없음"}\n` +
        `path: ${data?.path ?? "알 수 없음"}`;

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: answerText },
      ]);
    } catch (e) {
      const s = e?.response?.status;
      const d = e?.response?.data;
      const errMsg = `업로드 실패: ${s || ""} ${e.message}${
        d ? " " + JSON.stringify(d) : ""
      }`;
      setMsg(errMsg);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: `❌ ${errMsg}` },
      ]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} subtitle="Workspace" />

      <main className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* 좌상단: PDF 업로드 카드 */}
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
                isDragging
                  ? "border-[#9D6BFF] bg-purple-50"
                  : "border-[#D9C6FF]",
              ].join(" ")}
              style={{ minHeight: 180 }}
            >
              <div className="flex items-center gap-4">
                <img src="/Upload.svg" alt="Upload" className="w-10 h-10" />
                <div>
                  <p className="text-[20px] font-semibold text-[#111] leading-tight">
                    {fileName || "Drop your PDF here"}
                  </p>
                  <div className="mt-2">
                    <img
                      src="/SelectFile.svg"
                      alt="Select file"
                      className="h-8"
                    />
                  </div>
                  {fileName && (
                    <p className="mt-1 text-xs text-gray-500">
                      선택된 파일: {fileName}
                    </p>
                  )}
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

          {/* 우측: 응답/디버그 패널 (원래 결과 보여주는 곳) */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl bg-white p-8 text-gray-800 shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] min-h-[520px]">
            {!fileName && !resp && !uploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-[#8B8E99]">
                  <p className="mb-3 text-[18px]">
                    Upload a document
                    <br />
                    to start creating
                  </p>
                  <div className="text-2xl">🎬</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {fileName && (
                  <div className="text-sm">
                    선택된 파일: <b>{fileName}</b>
                  </div>
                )}

                {msg && (
                  <div className="text-sm text-gray-700">메시지: {msg}</div>
                )}

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>진행 중…</span>
                    <span
                      className="inline-block h-4 w-4 rounded-full border-2 border-[#C4B5FD] border-t-[#7C3AED] animate-spin"
                      aria-label="Loading"
                    />
                  </div>
                )}

                {resp && (
                  <div>
                    <h2 className="font-semibold mb-2">서버 응답(JSON)</h2>
                    <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border">
                      {JSON.stringify(resp, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 좌하단: 채팅 영역 (프롬프트 작성 + 전송) */}
          <div className="lg:col-span-1 lg:-ml-2 rounded-2xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] flex flex-col">
            {/* 메시지 리스트 */}
            <div className="flex-1 px-4 pt-4 pb-2 overflow-y-auto text-sm space-y-2">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#8B8E99] text-center text-sm">
                  먼저 PDF를 업로드한 뒤,<br />
                  아래 채팅창에 요약 프롬프트를 입력하고<br />
                  전송 버튼을 눌러 주세요.
                </div>
              ) : (
                chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={
                      m.role === "user"
                        ? "text-right"
                        : "text-left text-[#4B5563]"
                    }
                  >
                    <div
                      className={
                        "inline-block px-3 py-2 rounded-2xl whitespace-pre-wrap " +
                        (m.role === "user"
                          ? "bg-[#6B4CF6] text-white"
                          : "bg-gray-100 text-gray-800")
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 입력 + 전송 버튼 */}
            <div className="px-4 pb-4 pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-3 outline-none text-sm"
                  placeholder="이 PDF에서 핵심 아이디어를 요약해줘"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={uploading}
                  className="min-w-10 min-h-10 grid place-items-center rounded-full bg-[#6B4CF6] text-white text-lg disabled:bg-gray-300"
                >
                  ↑
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#9CA3AF]">
                이 입력이 그대로 <code>?prompt=...</code> 로 전송됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
