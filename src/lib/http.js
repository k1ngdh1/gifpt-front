import axios from "axios";

// ① axios 기본 설정
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,  // .env.local의 /api
  withCredentials: import.meta.env.VITE_USE_CREDENTIALS === "true",
  timeout: 15000, // 15초 타임아웃
});

// API prefix (/v1)도 변수로 관리 (편의용)
const PREFIX = import.meta.env.VITE_API_PREFIX || "/v1";

// ② 요청 전 인터셉터: JWT 토큰 자동 추가
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ③ 응답 인터셉터: 토큰 만료 시 refresh 시도
let refreshing = null;
http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err || {};
    if (response?.status === 401 && !config._retry) {
      config._retry = true;
      if (!refreshing) {
        refreshing = http
          .post(`${PREFIX}/auth/refresh`, {
            refreshToken: localStorage.getItem("refresh_token"),
          })
          .then(({ data }) => {
            const at = data?.accessToken || data?.access_token;
            if (at) localStorage.setItem("access_token", at);
            return at;
          })
          .finally(() => (refreshing = null));
      }
      const newAT = await refreshing;
      if (newAT) {
        config.headers.Authorization = `Bearer ${newAT}`;
        return http(config);
      }
    }
    return Promise.reject(err);
  }
);

// ④ export 해서 다른 파일에서 쓸 수 있게
export { http, PREFIX };
