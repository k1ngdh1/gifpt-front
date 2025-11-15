// src/pages/WorkspacePage.jsx
import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import { uploadFile } from "../api/file";
import { getJob } from "../api/jobs";     // ✅ 추가

export default function WorkspacePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [msg, setMsg] = useState("");
  const [resp, setResp] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ 폴링용 상태
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState(""); // PENDING/RUNNING/DONE/ERROR

  const openPicker = () => document.getElementById("pdf-input")?.click();

  const doUpload = async (file) => {
    setUploading(true);
    setMsg("업로드 중…");
    setResp(null);
    setJobId("");
    setStatus("");
    try {
      const data = await uploadFile(file); // { jobId: "...", ... } 기대
      setResp(data);
      const jid = data?.jobId || data?.id || "";
      if (jid) {
        setJobId(jid);
        setStatus("PENDING");
        setMsg("작업 대기열에 등록됨");
      } else {
        setMsg("업로드 완료(작업 ID 없음)");
      }
    } catch (e) {
      const s = e?.response?.status;
      const d = e?.response?.data;
      setMsg(`업로드 실패: ${s || ""} ${e.message}${d ? " " + JSON.stringify(d) : ""}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("PDF만 업로드하세요.");
      return;
    }
    setFileName(file.name);
    doUpload(file);
  }, []);

  const onInputChange = (e) => handleFiles(e.target.files);
  const onDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDrop      = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); };

  // ✅ 간단 폴링 루프
  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    let timer;

    const tick = async () => {
      try {
        const data = await getJob(jobId);      // { status, result, ... } 가정
        const st = data?.status || "";
        setStatus(st);
        if (st === "DONE") {
          setMsg("완료");
          setResp((prev) => ({ ...prev, result: data?.result ?? data })); // 결과 합침
          return; // stop
        }
        if (st === "ERROR") {
          setMsg(data?.message || "작업 오류");
          return; // stop
        }
        if (!stop) timer = setTimeout(tick, 2000);
      } catch (e) {
        setMsg(`상태 조회 실패: ${e?.response?.status || ""} ${e.message}`);
        if (!stop) timer = setTimeout(tick, 4000);
      }
    };

    tick();
    return () => { stop = true; clearTimeout(timer); };
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
                isDragging ? "border-[#9D6BFF] bg-purple-50" : "border-[#D9C6FF]"
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

          {/* 결과/상태 패널 */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-2xl bg-white p-8 text-gray-800 shadow-[0_6px_18px_rgba(0,0,0,0.06)] border border-[#EEE] min-h-[520px]">
            {!fileName && !resp && !uploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-[#8B8E99]">
                  <p className="mb-3 text-[18px]">
                    Upload a document<br/>to start creating
                  </p>
                  <div className="text-2xl">🎬</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 space-y-1">
                  {fileName && <div>파일: <b>{fileName}</b></div>}
                  {jobId &&   <div>작업 ID: <code>{jobId}</code></div>}
                  {status &&  <div>상태: <b>{status}</b></div>}

                  {/* 🔥 여기 스피너 추가 */}
                  {uploading || status === "PENDING" || status === "RUNNING" ? (
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

          {/* 좌하단: 채팅(더미) */}
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
