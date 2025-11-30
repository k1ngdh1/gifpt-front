// src/api/workspaces.js
import { http, PREFIX } from "../lib/http";

/**
 * POST /api/v1/workspaces
 * body: { title, fileId, userPrompt }
 */
export async function createWorkspace({ title, fileId, userPrompt }) {
  const { data } = await http.post(`${PREFIX}/workspaces`, {
    title,
    fileId,
    userPrompt,
  });
  return data;
}

/**
 * POST /api/v1/workspaces/from-file
 * body: { title, fileId, userPrompt }
 * - 파일을 이미 업로드한 후 워크스페이스를 생성할 때 사용
 */
export async function createWorkspaceFromFile({ title, fileId, userPrompt }) {
  const { data } = await http.post(`${PREFIX}/workspaces/from-file`, {
    title,
    fileId,
    userPrompt,
  });
  return data;
}

/**
 * GET /api/v1/workspaces/{workspaceId}
 * - status / resultUrl / summary 등을 조회
 */
export async function getWorkspace(workspaceId) {
  const { data } = await http.get(`${PREFIX}/workspaces/${workspaceId}`);
  return data;
}
