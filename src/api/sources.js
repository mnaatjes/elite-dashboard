import { apiClient } from './client';

export const sourcesApi = {
  getSources() {
    return apiClient('/sources/');
  },
  
  createSource(payload) {
    return apiClient('/sources/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateSource(sourceId, payload) {
    return apiClient(`/sources/${sourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }
};
