// src/pages/WorkspacePage.jsx
import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadFile } from "../api/file";
import { createWorkspace, getWorkspace, chatWorkspace} from "../api/workspaces";

export default function WorkspacePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null); // 선택된 실제 파일
  const [msg, setMsg] = useState("");
  const [resp, setResp] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 워크스페이스 상태
  const [workspaceId, setWorkspaceId] = useState(null);
  const [status, setStatus] = useState(""); // PENDING/RUNNING/DONE/ERROR

  // 채팅(프롬프트) 상태
  const [prompt, setPrompt] = useState("이 PDF에서 핵심 아이디어를 요약해줘");
  const [chatMessages, setChatMessages] = useState([]); // { role: 'user' | 'assistant', text }

  const openPicker = () => document.getElementById("pdf-input")?.click();

  // 🔥 실제 업로드 + 워크스페이스 생성 함수
  const doUploadAndCreateWorkspace = async (fileToUpload, promptText) => {
    setUploading(true);
    setMsg("업로드 및 워크스페이스 생성 중…");
    setResp(null);
    setWorkspaceId(null);
    setStatus("");

    try {
      // 1) 파일 업로드 → fileId 획득
      const fileRes = await uploadFile(fileToUpload, promptText);
      // 예상 응답: { path, fileName, fileId, message, ... }
      const fileId = fileRes?.fileId;

      if (!fileId) {
        const err = "파일 업로드 응답에 fileId가 없습니다.";
        setMsg(err);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: `❌ ${err}` },
        ]);
        return;
      }

      // 안내 메시지 추가
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `✅ 파일 업로드 완료. 워크스페이스를 생성합니다.`,
        },
      ]);

      // 2) 워크스페이스 생성
      const title =
        fileRes?.fileName?.replace(/\.pdf$/i, "") ||
        fileToUpload.name.replace(/\.pdf$/i, "") ||
        "새 워크스페이스";

      const ws = await createWorkspace({
        title,
        fileId,
        userPrompt: promptText,
      });

      // 예상 응답: { id, title, prompt, pdfPath, summary, videoUrl, status, ... }
      setResp(ws);
      setWorkspaceId(ws.id);
      setStatus(ws.status || "PENDING");
      setMsg("워크스페이스가 생성되었습니다. 분석이 진행 중입니다.");

    } catch (e) {
      const s = e?.response?.status;
      const d = e?.response?.data;
      const err = `업로드/워크스페이스 생성 실패: ${s || ""} ${e.message}${
        d ? " " + JSON.stringify(d) : ""
      }`;
      setMsg(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: `❌ ${err}` },
      ]);
    } finally {
      setUploading(false);
      // 업로드 끝나면 업로드 영역 clean 상태로 리셋
      setFile(null);
      setFileName("");
    }
  };

  // PDF 선택/드롭 시: 아직 서버 호출 X, 파일만 기억
  const handleFiles = useCallback((files) => {
    const selected = files?.[0];
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("PDF만 업로드하세요.");
      return;
    }
    setFile(selected);
    setFileName(selected.name);
    setResp(null);
    setWorkspaceId(null);
    setStatus("");
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

  // 🔥 채팅 전송 버튼: 여기서 파일 + 프롬프트 업로드 + 워크스페이스 생성
// 🔥 채팅 전송 버튼: 
//  - 아직 워크스페이스가 없으면 → 파일 업로드 + 워크스페이스 생성
//  - 이미 워크스페이스가 있으면 → 해당 워크스페이스에 /chat 요청
const handleSend = async () => {
  if (uploading) return;

  if (!prompt.trim()) {
    setMsg("프롬프트를 입력해 주세요.");
    return;
  }

  const promptText = prompt.trim();

  // 유저 메시지 채팅 로그에 추가
  setChatMessages((prev) => [...prev, { role: "user", text: promptText }]);

  // 엔터 치자마자 인풋 비우기
  setPrompt("");

  // 1️⃣ 아직 워크스페이스가 없는 경우 → 최초 프롬프트로 생성
  if (!workspaceId) {
    if (!file) {
      setMsg("먼저 PDF 파일을 업로드하세요.");
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "❗ 먼저 위에서 PDF 파일을 선택(또는 드래그&드롭)해 주세요.",
        },
      ]);
      return;
    }

    await doUploadAndCreateWorkspace(file, promptText);
    return;
  }

  // 2️⃣ 이미 워크스페이스가 만들어진 후 → 챗엔드포인트 호출
  try {
    setMsg("질문을 전송했습니다. 응답을 기다리는 중입니다.");
    const data = await chatWorkspace(workspaceId, promptText);

    // 백엔드 응답에서 답변 텍스트만 추출 (형식 방어적으로 처리)
    const assistantText =
      data?.reply ||
      data?.message ||
      data?.content ||
      (typeof data === "string"
        ? data
        : "응답을 받았지만 표시할 수 없는 형식입니다.");

    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", text: assistantText },
    ]);

    // 혹시 응답에 workspace 정보가 같이 오면 화면에도 반영
    if (data?.workspace) {
      setResp(data.workspace);
      setStatus(data.workspace.status || status);
    }
  } catch (e) {
    const errMsg = `챗봇 요청 실패: ${e?.response?.status || ""} ${
      e.message
    }`;
    setMsg(errMsg);
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", text: `❌ ${errMsg}` },
    ]);
  }
};



  // ✅ 워크스페이스 상태 폴링 루프
  useEffect(() => {
    if (!workspaceId) return;
    let stop = false;
    let timer;

    const tick = async () => {
      try {
        const data = await getWorkspace(workspaceId); // { status, summary, ... } 가정
        const st = data?.status || "";
        setStatus(st);
        setResp(data);

        if (st === "DONE") {
          setMsg("분석이 완료되었습니다.");
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: "✅ 분석이 완료되었습니다. 우측 패널에서 요약 결과를 확인하세요.",
            },
          ]);
          return; // stop
        }
        if (st === "ERROR") {
          const errMsg = data?.message || "작업 오류";
          setMsg(errMsg);
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", text: `❌ ${errMsg}` },
          ]);
          return; // stop
        }
        if (!stop) timer = setTimeout(tick, 5000);
      } catch (e) {
        const errMsg = `워크스페이스 상태 조회 실패: ${
          e?.response?.status || ""
        } ${e.message}`;
        setMsg(errMsg);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: `❌ ${errMsg}` },
        ]);
        if (!stop) timer = setTimeout(tick, 5000);
      }
    };

    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} subtitle="Workspace" />

      <main className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* 업로드 카드 */}
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

                    {/* 결과/상태 패널 */}
                    <div className="lg:col-span-2 lg:row-span-2 rounded-2xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] min-h-[520px]">
            {/* 아직 아무 것도 안 한 상태 */}
            {!fileName && !resp && !uploading && !workspaceId ? (
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
            ) : uploading ||
              status === "PENDING" ||
              status === "RUNNING" ? (
              /* 🔥 분석 중(업로드/대기/PENDING/RUNNING)일 때: 전체 로딩 화면 */
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 py-8">
                <div className="h-12 w-12 rounded-full border-4 border-[#E5E7EB] border-t-[#7C3AED] animate-spin mb-4" />
                <p className="text-[15px] text-[#4B5563] font-medium">
                  PDF를 분석하고 있어요...
                </p>
                <p className="mt-1 text-[13px] text-[#9CA3AF]">
                  내용 이해 · 요약 · 영상 스크립트 생성까지 잠시만 기다려 주세요.
                </p>
                {workspaceId && (
                  <p className="mt-3 text-[11px] text-[#D1D5DB]">
                    워크스페이스 ID: {workspaceId}
                  </p>
                )}
              </div>
            ) : (
              /* ✅ 분석 완료 또는 실패했을 때: 실제 결과 표시 */
              <div className="space-y-3 px-6 py-5">
                {/* 상단 상태 정보 */}
                <div className="text-sm text-gray-600 space-y-1">
                  {workspaceId && (
                    <div>
                      워크스페이스 ID: <b>{workspaceId}</b>
                    </div>
                  )}
                  {status && (
                    <div>
                      상태:{" "}
                      <b
                        className={
                          status === "SUCCESS"
                            ? "text-green-600"
                            : status === "FAILED"
                            ? "text-red-500"
                            : "text-gray-700"
                        }
                      >
                        {status}
                      </b>
                    </div>
                  )}
                  {msg && <div>메시지: {msg}</div>}
                </div>

                {/* 요약 결과가 있다면 먼저 보여주기 */}
                {resp?.summary && (
                  <div className="mt-2">
                    <h2 className="font-semibold mb-2">요약 결과</h2>
                    <div className="text-sm whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border">
                      {resp.summary}
                    </div>
                  </div>
                )}

                {/* 생성된 영상 재생 */}
                {resp?.videoUrl && (
                  <div className="mt-4">
                    <h2 className="font-semibold mb-2">생성된 영상</h2>
                    <video
                      src={resp.videoUrl}
                      controls
                      className="w-full max-h-[360px] rounded-xl border bg-black"
                    />
                  </div>
                )}

                
              </div>
            )}
          </div>


          {/* 좌하단: 채팅 UI (프롬프트 입력/전송) */}
          <div className="lg:col-span-1 lg:-ml-2 rounded-2xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] flex flex-col">
            {/* 채팅 메시지 영역 */}
            <div className="h-[360px] flex flex-col px-4 pt-4 pb-2 overflow-y-auto text-sm space-y-2">
              {chatMessages.length === 0 ? (
                <div className="m-auto text-center text-[#8B8E99] text-sm">
                  1) 위에서 PDF를 업로드한 뒤,<br />
                  2) 아래 채팅창에 요약 프롬프트를 입력하고<br />
                  3) 전송 버튼(↑)을 눌러 주세요.
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

            {/* 입력창 + 전송 버튼 */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-3 outline-none"
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
                  className="min-w-10 min-h-10 grid place-items-center rounded-full bg-[#6B4CF6] text-white disabled:bg-gray-300"
                >
                  ↑
                </button>
              </div>
              <p className="mt-1 text-[11px] text-[#9CA3AF]">
                먼저 PDF를 선택한 뒤, 이 입력을 워크스페이스 생성 프롬프트로 전송합니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
