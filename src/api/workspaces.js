import { http, PREFIX } from "../lib/http";

export async function createWorkspace({ title, fileId, userPrompt }) {
  const { data } = await http.post(`${PREFIX}/workspaces`, {
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
