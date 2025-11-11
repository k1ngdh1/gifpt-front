// src/components/AuthModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { signup, login, me } from "../api/auth";   // 3단계에서 만든 API 래퍼
import { useAuth } from "../state/auth";           // 전역 사용자 상태 (선택이지만 권장)

export default function AuthModal({ open, mode = "login", onClose, onSuccess }) {
  const emailRef = useRef(null);
  const { setUser } = useAuth?.() ?? { setUser: () => {} }; // 혹시 AuthProvider 미적용이어도 안전하게

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");             // signup용 confirm password
  const [displayName, setDisplayName] = useState(""); // signup용 표시 이름(백엔드 스웨거에 맞춤)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
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
      : "w-[402px] h-[560px] p-[39px]"; // 표시이름/확인비번 추가로 살짝 키움

  const title = mode === "signup" ? "Sign Up" : "Log In";
  const cta   = mode === "signup" ? "Create Account" : "Log In";

  const errMsg = (e) => {
    const s = e?.response?.status;
    const d = e?.response?.data;
    return d?.message || d?.error || (s ? `요청 실패 (${s})` : e?.message || "요청 실패");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 간단 검증
    if (!email || !pw) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    if (mode === "signup") {
      if (!displayName) {
        setError("표시 이름을 입력해 주세요.");
        return;
      }
      if (pw !== pw2) {
        setError("비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        // 스웨거: { email, password, displayName }
        await signup({ email, password: pw, displayName });
        // 보통은 회원가입 후 자동 로그인하거나, 바로 로그인 안내
        // 여기선 자동 로그인 수행
        await login({ email, password: pw });
      } else {
        await login({ email, password: pw });
      }

      // 토큰 저장은 login()에서 처리됨. 내 정보 조회
      const profile = await me();
      setUser?.(profile);
      onSuccess?.(profile);
      onClose?.();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
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

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-4 w-[324px]">
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                       shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                       focus:border-[#9B4DFF]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                       shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                       focus:border-[#9B4DFF]"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {mode === "signup" && (
            <>
              <input
                type="text"
                placeholder="Display Name"
                className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                           shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                           focus:border-[#9B4DFF]"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-[16px]
                           shadow-[0_4px_0_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-400
                           focus:border-[#9B4DFF]"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                required
                autoComplete="new-password"
              />
            </>
          )}

          {/* 에러 문구 */}
          {error && (
            <p className="text-center text-[14px] font-semibold text-red-500 pt-1">
              {error}
            </p>
          )}

          {/* CTA 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[14px] px-6 py-3 text-[20px] font-semibold text-white
                       bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] shadow-md hover:opacity-90 transition
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중…" : cta}
          </button>
        </form>
      </div>
    </div>
  );
}
