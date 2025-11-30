// src/api/jobs.js

// 과거: /v1/jobs, /v1/analysis 로 직접 조회
// 현재: 백엔드에 해당 GET 엔드포인트가 없고,
//       Workspace 에 status/result 가 들어가므로
//       워크스페이스 조회로 우회.

import { getWorkspace } from "./workspaces";

/**
 * getJob(jobId)
 *
 * 과거 jobId == 백엔드 job 리소스 ID였지만,
 * 지금은 jobId == workspaceId 로 간주하고
 * GET /api/v1/workspaces/{id} 를 조회한다.
 *
 * - 반환값 예: { id, status, resultUrl, summary, ... }
 */
export async function getJob(jobId) {
  return getWorkspace(jobId);
}
