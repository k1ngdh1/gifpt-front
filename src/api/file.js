// src/api/file.js
import { http, PREFIX } from "../lib/http";   // ✅ PREFIX 같이 사용

// file + prompt 함께 전송
export async function uploadFile(file, prompt) {
  const form = new FormData();
  form.append("file", file); // 스웨거에 'file' 로 정의되어 있음

  const { data } = await http.post(
    `${PREFIX}/file/upload`,      // ✅ /api/v1/file/upload 로 호출
    form,
    {
      params: prompt ? { prompt } : undefined, // ?prompt=...
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return data; // 백엔드 응답 그대로 반환
}
