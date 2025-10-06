import axios from 'axios';

const API_BASE_URL = 'https://exo-planetas-backend.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Enhanced error handling
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    } else if (error.response?.status === 404) {
      throw new Error('Service not found - please check if backend is running');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error - please try again later');
    } else if (error.response?.status === 422) {
      throw new Error('Invalid data format - please check your input');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API service for exoplanet classification
 */
export const exoplanetAPI = {
  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  /**
   * Predict exoplanet classification
   * @param {Object} exoplanetData - Exoplanet data object
   * @returns {Promise<Object>} Prediction result with confidence
   */
  async predictExoplanet(exoplanetData) {
    try {
      const response = await api.post('/predict', exoplanetData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) {
        throw new Error('Invalid exoplanet data format');
      } else if (error.response?.status === 500) {
        throw new Error('Prediction service error');
      } else {
        throw new Error(`Prediction failed: ${error.message}`);
      }
    }
  },

  /**
   * Get model information
   */
  async getModelInfo() {
    try {
      const response = await api.get('/model/info');
      return response.data;
    } catch (error) {
      throw new Error(`Model info request failed: ${error.message}`);
    }
  },

  /**
   * Upload new data for training
   */
  async uploadData(formData) {
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Data upload failed: ${error.message}`);
    }
  },

  /**
   * Train model with new data
   */
  async trainModel(config) {
    try {
      const response = await api.post('/train', config);
      return response.data;
    } catch (error) {
      throw new Error(`Model training failed: ${error.message}`);
    }
  },

  /**
   * Get model statistics
   */
  async getModelStats() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Model stats request failed: ${error.message}`);
    }
  },

  /**
   * Tune hyperparameters
   */
  async tuneHyperparameters(parameters) {
    try {
      const response = await api.post('/tune', parameters);
      return response.data;
    } catch (error) {
      throw new Error(`Hyperparameter tuning failed: ${error.message}`);
    }
  },

  /**
   * Get training history
   */
  async getTrainingHistory() {
    try {
      const response = await api.get('/training-history');
      return response.data;
    } catch (error) {
      throw new Error(`Training history request failed: ${error.message}`);
    }
  },

  /**
   * List uploaded files
   */
  async listUploads() {
    try {
      const response = await api.get('/uploads');
      return response.data;
    } catch (error) {
      throw new Error(`List uploads failed: ${error.message}`);
    }
  },

  /**
   * List all trained models
   */
  async listModels() {
    try {
      const response = await api.get('/models');
      return response.data;
    } catch (error) {
      throw new Error(`List models failed: ${error.message}`);
    }
  },

  /**
   * Activate a specific model
   */
  async activateModel(modelId) {
    try {
      const response = await api.post(`/models/${modelId}/activate`);
      return response.data;
    } catch (error) {
      throw new Error(`Activate model failed: ${error.message}`);
    }
  },

  /**
   * Export all results
   */
  async exportResults() {
    try {
      const response = await api.get('/export/results');
      return response.data;
    } catch (error) {
      throw new Error(`Export results failed: ${error.message}`);
    }
  }
};

/**
 * Generate sample exoplanet data for testing
 */
export const generateSampleExoplanetData = (overrides = {}) => {
  const baseData = {
    koi_period_err1: Math.random() * 0.2,
    koi_period_err2: Math.random() * 0.2,
    koi_time0bk: 1000 + Math.random() * 1000,
    koi_time0bk_err1: Math.random() * 1.0,
    koi_time0bk_err2: Math.random() * 1.0,
    koi_impact: Math.random(),
    koi_duration: 1 + Math.random() * 20,
    koi_duration_err1: Math.random() * 0.2,
    koi_duration_err2: Math.random() * 0.2,
    koi_depth: 0.001 + Math.random() * 0.1,
    koi_depth_err1: Math.random() * 0.01,
    koi_model_snr: 5 + Math.random() * 45,
    koi_steff_err1: Math.random() * 100,
    koi_srad_err1: Math.random() * 0.2,
    delivname_q1_q16_tce: 'Q1-Q16-TCE',
    delivname_q1_q17_dr24_tce: 'Q1-Q17-DR24-TCE',
    delivname_q1_q17_dr25_tce: 'Q1-Q17-DR25-TCE',
    koi_name: `KOI-${Math.floor(Math.random() * 10000)}`,
    ra: Math.random() * 360,
    dec: (Math.random() - 0.5) * 180,
    koi_period: 1 + Math.random() * 1000,
    koi_steff: 3000 + Math.random() * 3000,
    koi_srad: 0.5 + Math.random() * 2.0,
    ...overrides
  };

  return baseData;
};

export default api;
