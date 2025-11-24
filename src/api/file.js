// src/api/file.js
import { http } from "../lib/http";
const PREFIX = "/v1"; // 스웨거 기준

// file + prompt 함께 전송
export async function uploadFile(file, prompt) {
  const form = new FormData();
  form.append("file", file); // 스웨거에 'file'로 보임

  const { data } = await http.post(`${PREFIX}/file/upload`, form, {
    // Postman이랑 똑같이 ?prompt=... 로 보내기
    params: prompt ? { prompt } : undefined,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // 백엔드 응답 그대로 반환
}
