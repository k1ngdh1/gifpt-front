// src/api/file.js
import { http } from "../lib/http";
const PREFIX = "/v1"; // 스웨거 기준

// file + prompt 함께 전송
export async function uploadFile(file, prompt) {
  const form = new FormData();
  form.append("file", file); // 백엔드에서 받는 필드명

  const { data } = await http.post(`${PREFIX}/file/upload`, form, {
    // 👉 Postman과 똑같이 ?prompt=... 으로 보냄
    params: prompt ? { prompt } : undefined,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // { path, fileName, message, fileId, ... }
}
