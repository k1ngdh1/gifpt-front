// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/auth";
import { logout } from "../api/auth";

export default function Navbar({
  onLoginClick,
  onSignupClick,
  showAuthButtons = true,
  subtitle,
}) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [busy, setBusy] = useState(false);

  const doLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
      setUser(null);
      // 필요하면 navigate("/") 등
    } finally {
      setBusy(false);
    }
  };

  return (
    <nav className="flex justify-between items-center w-full px-16 py-6 border-b border-gray-200 bg-white">
      {/* 로고 (홈 이동) */}
      <div
        className="flex items-center gap-3 select-none cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/logo.png" alt="GIFPT logo" className="h-12 w-12" />
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

      {/* 우측 영역 */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              {user.displayName || user.email}
            </span>
            <button
              className="px-3 py-2 rounded border hover:bg-gray-50"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="px-3 py-2 rounded bg-gray-900 text-white hover:opacity-90 disabled:opacity-60"
              onClick={doLogout}
              disabled={busy}
            >
              {busy ? "…" : "Logout"}
            </button>
          </>
        ) : (
          showAuthButtons && (
            <>
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
            </>
          )
        )}
      </div>
    </nav>
  );
}
