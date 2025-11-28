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
  // 예: { id, title, prompt, pdfPath, summary, videoUrl, status, ... }
  return data;
}

/**
 * GET /api/v1/workspaces/{workspaceId}
 */
export async function getWorkspace(workspaceId) {
  const { data } = await http.get(`${PREFIX}/workspaces/${workspaceId}`);
  return data;
}
