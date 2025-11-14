import axios from "axios";

// ① axios 기본 설정
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,  // .env.local의 /api
  withCredentials: true,                  // ★ 쿠키 항상 같이 보내기
  timeout: 15000,
});

// API prefix (/v1)
const PREFIX = import.meta.env.VITE_API_PREFIX || "/v1";

// 토큰 안 붙일 경로들 (회원가입/로그인/리프레시/헬스)
const NO_AUTH_PATHS = [
  `${PREFIX}/auth/signup`,
  `${PREFIX}/auth/login`,
  `${PREFIX}/auth/refresh`,
  "/healthz",
];

// ② 요청 인터셉터: JWT 자동 추가 (공개 엔드포인트는 제외)
http.interceptors.request.use((config) => {
  const url = config.url || "";

  // NO_AUTH_PATHS에 포함되면 그냥 토큰 안 붙이고 통과
  if (NO_AUTH_PATHS.some((p) => url.startsWith(p))) {
    return config;
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ③ 응답 인터셉터: 401이면 refresh 시도
let refreshing = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (response?.status === 401 && !config._retry) {
      // refresh 자기 자신 호출이면 재귀 방지
      if (config.url?.startsWith(`${PREFIX}/auth/refresh`)) {
        return Promise.reject(err);
      }

      config._retry = true;

      if (!refreshing) {
        // ★ body에 refreshToken 절대 안 넘김 (쿠키만)
        refreshing = http
          .post(`${PREFIX}/auth/refresh`)
          .then(({ data }) => {
            const at = data?.accessToken || data?.access_token;
            if (at) {
              localStorage.setItem("access_token", at);   // 새 access 저장
              return at;
            }
            return null;
          })
          .finally(() => {
            refreshing = null;
          });
      }

      const newAT = await refreshing;
      if (newAT) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newAT}`;
        return http(config);
      }
    }
    return Promise.reject(err);
  }
);

export { http, PREFIX };
