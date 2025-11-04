import Navbar from "../components/Navbar";

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-[#F7F7FD]">
      <Navbar showAuthButtons={false} />

      <header className="flex items-center gap-3 px-10 py-6">
        <img src="/logo.png" alt="GIFPT" className="h-8" />
        <h1 className="text-2xl font-semibold text-[#5A4FCF]">Workspace</h1>
      </header>

      <main className="px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ✅ 드롭존 전체를 버튼화 */}
          <label className="cursor-pointer rounded-xl border-2 border-dashed border-purple-300 bg-white p-8 flex flex-col items-center justify-center gap-4 hover:bg-purple-50 transition">
            <img
              src="/Upload.svg"
              alt="Upload"
              className="w-12 h-12 object-contain"
            />
            <p className="text-xl font-semibold text-black">
              Drop your PDF here
            </p>
            <img
              src="/SelectFile.svg"
              alt="Select file"
              className="w-[130px] h-auto"
            />
            {/* 숨겨진 파일 입력 */}
            <input type="file" accept="application/pdf" className="hidden" />
          </label>

          {/* 우측: 프리뷰/생성 패널 */}
          <div className="rounded-xl border bg-white p-8 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="mb-3">Upload a document to start creating</p>
              <div className="text-2xl">🎬</div>
            </div>
          </div>

          {/* 좌하단: 채팅 패널 */}
          <div className="rounded-xl border bg-white p-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Upload a document to start chatting
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Type a message..."
                />
                <button className="p-2 rounded-full bg-[#6B4CF6] text-white">
                  ↑
                </button>
              </div>
            </div>
          </div>

          {/* 우하단: 여백 자리 */}
          <div className="rounded-xl border bg-white p-8 flex items-center justify-center text-gray-300">
            (Reserved)
          </div>
        </div>
      </main>
    </div>
  );
}
