import { http } from "../lib/http";
const PREFIX = "/v1";

// 우선순위 1: /v1/jobs/{id}
// 우선순위 2: /v1/analysis/{id}
export async function getJob(jobId) {
  try {
    const { data } = await http.get(`${PREFIX}/jobs/${jobId}`);
    return data;
  } catch (e) {
    if (e?.response?.status === 404) {
      const { data } = await http.get(`${PREFIX}/analysis/${jobId}`);
      return data;
    }
    throw e;
  }
}
