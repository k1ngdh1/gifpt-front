// src/pages/WorkspacePage.jsx
import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadFile } from "../api/file";
import { getJob } from "../api/jobs";

export default function WorkspacePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);              // ✅ 실제 파일 저장
  const [msg, setMsg] = useState("");
  const [resp, setResp] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ 폴링용 상태
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState(""); // PENDING/RUNNING/DONE/ERROR

  // ✅ 채팅(프롬프트) 상태
  const [prompt, setPrompt] = useState("이 PDF에서 핵심 아이디어를 요약해줘");
  const [chatMessages, setChatMessages] = useState([]); // { role: 'user' | 'assistant', text }

  const openPicker = () => document.getElementById("pdf-input")?.click();

  // 🔥 실제 업로드 함수: 파일 + 프롬프트 같이 보냄
  const doUpload = async (fileToUpload, promptText) => {
    setUploading(true);
    setMsg("업로드 중…");
    setResp(null);
    setJobId("");
    setStatus("");

    try {
      const data = await uploadFile(fileToUpload, promptText); // { jobId: "...", ... } 기대
      setResp(data);
      const jid = data?.jobId || data?.id || "";
      if (jid) {
        setJobId(jid);
        setStatus("PENDING");
        setMsg("작업 대기열에 등록됨");

        // 채팅 로그에 서버 응답 안내 추가
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `✅ 파일 업로드 완료. 요약을 생성 중입니다. (jobId: ${jid})`,
          },
        ]);
      } else {
        const text = data?.message || "업로드 완료(작업 ID 없음)";
        setMsg(text);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: `✅ ${text}` },
        ]);
      }
    } catch (e) {
      const s = e?.response?.status;
      const d = e?.response?.data;
      const err = `업로드 실패: ${s || ""} ${e.message}${
        d ? " " + JSON.stringify(d) : ""
      }`;
      setMsg(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: `❌ ${err}` },
      ]);
    } finally {
      setUploading(false);
    }
  };

  // PDF 선택/드롭 시: 서버로 업로드 X, 파일만 기억
  const handleFiles = useCallback((files) => {
    if (uploading) return;
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
    setJobId("");
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

  // 🔥 채팅 전송 버튼: 여기서 파일 + 프롬프트 업로드
  const handleSend = async () => {
    if (!file) {
      setMsg("먼저 PDF 파일을 업로드하세요.");
      return;
    }
    if (!prompt.trim()) {
      setMsg("프롬프트를 입력해 주세요.");
      return;
    }

    const promptText = prompt.trim();

    // 유저 메시지 채팅 로그에 추가
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: promptText },
    ]);

    // 필요하면 프롬프트를 계속 남길지 비울지 선택 (여기선 남겨둠)
    // setPrompt("");

    await doUpload(file, promptText);

    setPrompt("");
    setFile(NULL);
    setFileName("");
  };

  // ✅ 간단 폴링 루프
  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    let timer;

    const tick = async () => {
      try {
        const data = await getJob(jobId); // { status, result, ... } 가정
        const st = data?.status || "";
        setStatus(st);
        if (st === "DONE") {
          setMsg("완료");
          setResp((prev) => ({ ...prev, result: data?.result ?? data })); // 결과 합침

          // 요약 끝났다는 메시지를 채팅에 남김
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: "✅ 요약 생성이 완료되었습니다. 우측 패널에서 결과를 확인하세요.",
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
        if (!stop) timer = setTimeout(tick, 2000);
      } catch (e) {
        const errMsg = `상태 조회 실패: ${e?.response?.status || ""} ${
          e.message
        }`;
        setMsg(errMsg);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: `❌ ${errMsg}` },
        ]);
        if (!stop) timer = setTimeout(tick, 4000);
      }
    };

    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [jobId]);

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
              <div className="space-y-3">
                <div className="text-sm text-gray-600 space-y-1">
                  {fileName && (
                    <div>
                      파일: <b>{fileName}</b>
                    </div>
                  )}
                  {jobId && (
                    <div>
                      작업 ID: <code>{jobId}</code>
                    </div>
                  )}
                  {status && (
                    <div>
                      상태: <b>{status}</b>
                    </div>
                  )}

                  {/* 🔥 여기 스피너 추가 */}
                  {uploading ||
                  status === "PENDING" ||
                  status === "RUNNING" ? (
                    <div className="flex items-center gap-2">
                      <span>메시지:</span>
                      <span
                        className="inline-block h-4 w-4 rounded-full border-2 border-[#C4B5FD] border-t-[#7C3AED] animate-spin"
                        aria-label="Loading"
                      />
                    </div>
                  ) : (
                    msg && <div>메시지: {msg}</div>
                  )}
                </div>

                {resp?.result && (
                  <div className="mt-2">
                    <h2 className="font-semibold mb-2">결과</h2>
                    <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border">
                      {JSON.stringify(resp.result, null, 2)}
                    </pre>
                  </div>
                )}

                {!resp?.result && resp && (
                  <div className="mt-2">
                    <h2 className="font-semibold mb-2">응답</h2>
                    <pre className="text-xs whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border">
                      {JSON.stringify(resp, null, 2)}
                    </pre>
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
                이 입력이 그대로 <code>?prompt=...</code> 로 전송됩니다. (먼저 PDF를
                업로드해야 합니다)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
