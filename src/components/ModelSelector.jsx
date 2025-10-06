import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exoplanetAPI } from '../services/api';
import { useNotifications } from './NotificationSystem';

export default function ModelSelector({ onModelChange, className = "", refreshTrigger }) {
  const [models, setModels] = useState([]);
  const [currentModelId, setCurrentModelId] = useState('default');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { success, error, info } = useNotifications();

  useEffect(() => {
    fetchModels();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchModels();
    }
  }, [refreshTrigger]);

  const fetchModels = async () => {
    try {
      console.log('🔄 Fetching models...');
      const response = await exoplanetAPI.listModels();
      console.log('📋 Models response:', response);
      setModels(response.models || []);
      setCurrentModelId(response.current_model_id || 'default');
      console.log('✅ Models updated:', response.models?.length || 0, 'models');
    } catch (err) {
      console.error('❌ Failed to fetch models:', err);
      error('Error', 'Failed to load models');
    }
  };

  const handleModelChange = async (modelId) => {
    if (modelId === currentModelId) return;
    
    setLoading(true);
    try {
      await exoplanetAPI.activateModel(modelId);
      setCurrentModelId(modelId);
      success('Model Changed', `Switched to ${models.find(m => m.id === modelId)?.name || 'Unknown Model'}`);
      
      if (onModelChange) {
        onModelChange(modelId);
      }
    } catch (err) {
      console.error('Failed to activate model:', err);
      error('Error', 'Failed to change model');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const currentModel = models.find(m => m.id === currentModelId) || models[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${currentModel?.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {currentModel?.name || 'Loading...'}
          </span>
          <span className="text-xs text-gray-500">
            ({currentModel ? (currentModel.accuracy * 100).toFixed(1) : '0'}%)
          </span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                disabled={loading}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 ${
                  model.id === currentModelId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${model.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {model.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {model.algorithm} • {new Date(model.training_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {(model.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      F1: {model.f1_score.toFixed(3)}
                    </div>
                  </div>
                </div>
                {model.is_default && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  </div>
                )}
              </button>
            ))}
            
            {models.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🤖</div>
                <p>No models available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
