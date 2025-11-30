import { http, PREFIX } from "../lib/http";

export async function createWorkspace({ title, fileId, userPrompt }) {
  const { data } = await http.post(`${PREFIX}/workspaces/from-file`, {
    title,
    fileId,
    userPrompt,
  });
  return data; // { id, status, summary, resultUrl, ... }
}

export async function getWorkspace(workspaceId) {
  const { data } = await http.get(`${PREFIX}/workspaces/${workspaceId}`);
  return data;
}
/**
 * 🆕 GET /api/v1/workspaces
 * - 내 워크스페이스 목록 조회
 * - 백엔드에서 Page<Workspace> 로 돌려줄 수도 있어서 둘 다 처리
 */
export async function listWorkspaces() {
  const { data } = await http.get(`${PREFIX}/workspaces`);
  // 1) 그냥 배열로 오는 경우: [ {id, title, ...}, ... ]
  if (Array.isArray(data)) return data;
  // 2) Spring Page 형식: { content: [...], totalElements, ... }
  if (Array.isArray(data?.content)) return data.content;
  return [];
}
