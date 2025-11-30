import axios from "axios";

// Vercel + EC2 프록시 구조:
// - vercel.json 에서 /api/** → EC2:80/api/** 로 리라이트
//   (이미 이렇게 설정되어 있음)
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "", // 배포에서는 보통 ""
  withCredentials: true,
  timeout: 15000,
});

// /api/v1 prefix
const PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

// 토큰 안 붙일 경로들
const NO_AUTH_PATHS = [
  `${PREFIX}/auth/signup`,
  `${PREFIX}/auth/login`,
  `${PREFIX}/auth/refresh`,
  "/healthz",
];

// 요청 인터셉터: JWT 자동 추가
http.interceptors.request.use((config) => {
  const url = config.url || "";
  if (NO_AUTH_PATHS.some((p) => url.startsWith(p))) return config;

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 → refresh 흐름 (지금 쓰는 코드 그대로 두면 됨)
let refreshing = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (response?.status === 401 && !config._retry) {
      if (config.url?.startsWith(`${PREFIX}/auth/refresh`)) {
        return Promise.reject(err);
      }
      config._retry = true;

      if (!refreshing) {
        refreshing = http
          .post(`${PREFIX}/auth/refresh`)
          .then(({ data }) => {
            const at = data?.accessToken || data?.access_token;
            if (at) {
              localStorage.setItem("access_token", at);
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

    if (typeof window !== "undefined") {
      window.__http = http;
      window.__PREFIX = PREFIX;
    }
    return Promise.reject(err);
  }
);

export { http, PREFIX };
