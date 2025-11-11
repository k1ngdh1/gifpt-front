import { http } from "../lib/http";
const PREFIX = "/v1"; // 스웨거 기준

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file); // 스웨거에 'file'로 보임
  const { data } = await http.post(`${PREFIX}/file/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // 백엔드 응답 그대로 반환
}
