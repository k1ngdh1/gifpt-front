import { getWorkspace } from "./workspaces";

// 옛날 getJob → 이제는 workspace 상태 조회로 사용
export async function getJob(jobId) {
  return getWorkspace(jobId);
}
