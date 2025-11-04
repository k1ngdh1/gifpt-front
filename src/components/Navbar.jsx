import { useNavigate } from "react-router-dom";

export default function Navbar({ onLoginClick, onSignupClick, showAuthButtons = true, subtitle }) {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center w-full px-16 py-6 border-b border-gray-200 bg-white">
      {/* 로고 (클릭 시 홈으로 이동) */}
      <div
        className="flex items-center gap-3 select-none cursor-pointer"
        onClick={() => navigate("/")} // ✅ 클릭 시 홈페이지로 이동
      >
        <img src="/logo.png" alt="GIFPT logo" className="h-8 w-8" />
        <h1
          className="text-[32px] md:text-[40px] font-extrabold leading-[120%] tracking-[-2.16px]
                     bg-gradient-to-r from-[#9B4DFF] to-[#00AEEF] bg-clip-text text-transparent"
        >
          GIFPT
        </h1>
        {subtitle && (
          <span className="ml-4 text-[28px] font-semibold bg-gradient-to-r from-[#9B4DFF] to-[#00AEEF] bg-clip-text text-transparent">
            {subtitle}
          </span>
        )}
      </div>

      {/* 로그인 / 회원가입 버튼 */}
      {showAuthButtons && (
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="text-[#333] font-medium hover:text-[#4B3DF6] transition-colors"
          >
            Log In
          </button>
          <button
            onClick={onSignupClick}
            className="px-4 py-2 rounded-md text-white font-semibold transition-colors
                       bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}
