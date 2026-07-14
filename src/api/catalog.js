import { apiClient } from './client';

export const catalogApi = {
  getLineage(sourceId) {
    return apiClient(`/catalog/lineage/${sourceId}`);
  },
  
  getTables(layer) {
    return apiClient(`/catalog/tables?layer=${layer}`);
  },

  getTemplates(sourceId, layer) {
    return apiClient(`/catalog/templates/${sourceId}?layer=${layer}`);
  },

  searchCatalog(query) {
    return apiClient(`/catalog/search?q=${encodeURIComponent(query)}`);
  },

  triggerBronzeSync(sourceId, limitMb = 10) {
    return apiClient(`/pipeline/bronze/sync/${sourceId}`, {
      method: 'POST',
      body: JSON.stringify({ limit_mb: limitMb })
    });
  },

  getBronzeCatalog(sourceId) {
    return apiClient(`/pipeline/bronze/catalog/${sourceId}`);
  },

  normalizeSilver(sourceId, payload) {
    return apiClient(`/pipeline/silver/normalize/${sourceId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  aggregateGold(sourceId, payload) {
    return apiClient(`/pipeline/gold/aggregate/${sourceId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  
  getAnalyticsOverview() {
    return apiClient('/analytics/overview');
  },

  validateSchema(payload) {
    return apiClient('/catalog/validate-schema/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  
  commitDag(sourceId, payload) {
    return apiClient(`/catalog/dag/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  runPipeline(sourceId) {
    return apiClient(`/pipeline/run/${sourceId}`, {
      method: 'POST'
    });
  },

  getPipelineStatus(sourceId) {
    return apiClient(`/pipeline/status/${sourceId}`);
  }
};
