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
 * GET /api/v1/workspaces/{workspaceId}
 */
export async function getWorkspace(workspaceId) {
  const { data } = await http.get(`${PREFIX}/workspaces/${workspaceId}`);
  return data;
}

/**
 * POST /api/v1/workspaces/{workspaceId}/chat
 * body: { message }
 */
export async function chatWorkspace(workspaceId, message) {
  const { data } = await http.post(
    `${PREFIX}/workspaces/${workspaceId}/chat`,
    { message }
  );
  // data 안에 뭐가 오는지에 따라 UI에서 뽑아 쓸 거라 그대로 리턴
  return data;
}
