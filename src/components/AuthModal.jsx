import React, { useEffect, useRef, useState } from "react";

export default function AuthModal({ open, mode = "login", onClose }) {
  const emailRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTimeout(() => emailRef.current?.focus(), 0);
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Figma 값: 로그인(402×413, p=39), 회원가입(399×502, p=39)
  const cardSize =
    mode === "login"
      ? "w-[402px] h-[413px] p-[39px]"
      : "w-[402px] h-[502px] p-[39px]";

  const title = mode === "signup" ? "Sign Up" : "Log In";
  const cta   = mode === "signup" ? "Create Account" : "Log In";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(mode === "login" ? "Username or Password is incorrect. Please try again." : "Email already in use.");
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* 배경 딤 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />

      {/* 모달 카드 (오른쪽 상단 배치) */}
      <div
        className={`
          absolute right-[40px] top-[140px] md:right-[72px] md:top-[160px]
          rounded-[30px] bg-[#FFFDFD] ${cardSize}
          flex flex-col items-start gap-4
        `}
            
        style={{ boxShadow: "-3px 4px 4px rgba(0,0,0,0.25)" }}
      >
        {/* 닫기 */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* 제목 */}
        <h2 className="text-[40px] font-extrabold leading-[120%] tracking-tight
                       bg-gradient-to-r from-[#9B4DFF] to-[#00AEEF] bg-clip-text text-transparent">
          {title}
        </h2>

        {/* 폼 (내부 너비 324px 권장: Figma padding 고려) */}
        <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-4 w-[324px]">
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                       shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                       focus:border-[#9B4DFF]"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                       shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                       focus:border-[#9B4DFF]"
          />

          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                         shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                         focus:border-[#9B4DFF]"
            />
          )}

          {/* 에러 문구 */}
          {error && (
            <p className="text-center text-[14px] font-semibold text-red-500 pt-1">
              {error}
            </p>
          )}

          {/* CTA 버튼: #8B5CF6 → #3B82F6 그라데이션 */}
          <button
            type="submit"
            className="mt-1 w-full rounded-[14px] px-6 py-3 text-[20px] font-semibold text-white
                       bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-md hover:opacity-90 transition"
          >
            {cta}
          </button>
        </form>
      </div>
    </div>
  );
}
