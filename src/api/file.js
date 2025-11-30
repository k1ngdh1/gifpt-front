import { http, PREFIX } from "../lib/http";

export async function uploadFile(file, prompt) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post(`${PREFIX}/file/upload`, form, {
    params: prompt ? { prompt } : undefined, // ?prompt=... 로 백에 넘김
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data; // { fileId, fileName, ... } 기대
}
