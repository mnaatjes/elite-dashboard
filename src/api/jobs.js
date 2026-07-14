import { apiClient } from './client';

export const jobsApi = {
  getJobs() {
    return apiClient('/jobs/');
  },
  
  getJobLogs(jobId) {
    return apiClient(`/jobs/${jobId}/logs`);
  }
};
