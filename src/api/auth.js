import { http, PREFIX } from "../lib/http";

// 회원가입: { email, password, displayName }
export const signup = (payload) =>
  http.post(`${PREFIX}/auth/signup`, payload).then(r => r.data);

// 로그인: { email, password } -> 토큰 저장
export const login = async ({ email, password }) => {
  const { data } = await http.post(`${PREFIX}/auth/login`, { email, password });
  // 백엔드 키 이름 유연 처리
  const at = data?.accessToken || data?.access_token;
  const rt = data?.refreshToken || data?.refresh_token;
  if (at) localStorage.setItem("access_token", at);
  if (rt) localStorage.setItem("refresh_token", rt);
  return data;
};

// 내 정보
export const me = () => http.get(`${PREFIX}/auth/me`).then(r => r.data);

// 로그아웃 (+ 로컬 토큰 비우기)
export const logout = async () => {
  try { await http.post(`${PREFIX}/auth/logout`); } catch {}
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
