import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // 배포에선 "/api"
  withCredentials: true,
  timeout: 15000,
});

const PREFIX = import.meta.env.VITE_API_PREFIX || "/v1";

const NO_AUTH_PATHS = [
  `${PREFIX}/auth/signup`,
  `${PREFIX}/auth/login`,
  `${PREFIX}/auth/refresh`,
  "/healthz",
];

http.interceptors.request.use((config) => {
  const url = config.url || "";

  if (NO_AUTH_PATHS.some((p) => url.startsWith(p))) {
    return config; // signup/login/refresh엔 Authorization 안 붙이기
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
          .post(`${PREFIX}/auth/refresh`)   // body 없이, 쿠키만
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
    return Promise.reject(err);
  }
);

export { http, PREFIX };
