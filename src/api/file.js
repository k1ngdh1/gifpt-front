// src/api/file.js
import { http } from "../lib/http";

const PREFIX = "/v1";

// 🔥 프롬프트까지 같이 보내도록 수정
export async function uploadFile(file, prompt) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post(`${PREFIX}/file/upload`, form, {
    // Postman과 동일하게 ?prompt=... 로 전송
    params: prompt ? { prompt } : undefined,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // { path, fileName, message, fileId, jobId? ... }
}
