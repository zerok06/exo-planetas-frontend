import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DataUpload from './DataUpload';
import ModelTraining from './ModelTraining';
import ModelStats from './ModelStats';
import HyperparameterTuning from './HyperparameterTuning';
import GalaxyScene from './GalaxyScene';
import { NotificationProvider } from './NotificationSystem';
import ConnectionStatus from './ConnectionStatus';
import ModelSelector from './ModelSelector';
import { exoplanetAPI } from '../services/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('visualization');
  const [modelStats, setModelStats] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentModelId, setCurrentModelId] = useState('default');
  const [modelRefreshTrigger, setModelRefreshTrigger] = useState(0);

  const tabs = [
    { id: 'visualization', label: '3D Visualization', icon: '🌌' },
    { id: 'upload', label: 'Data Upload', icon: '📊' },
    { id: 'training', label: 'Model Training', icon: '🧠' },
    { id: 'stats', label: 'Model Stats', icon: '📈' },
    { id: 'tuning', label: 'Hyperparameters', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchModelStats();
  }, []);

  const fetchModelStats = async () => {
    try {
      const stats = await exoplanetAPI.getModelStats();
      setModelStats(stats);
    } catch (error) {
      console.error('Failed to fetch model stats:', error);
    }
  };

  const handleModelChange = (modelId) => {
    setCurrentModelId(modelId);
    // Refresh stats when model changes
    fetchModelStats();
  };

  const handleModelTrained = (result) => {
    console.log('🎯 Model trained:', result);
    // Refresh model list and stats when a new model is trained
    fetchModelStats();
    setCurrentModelId(result.model_id);
    // Trigger model list refresh
    console.log('🔄 Triggering model list refresh...');
    setModelRefreshTrigger(prev => prev + 1);
  };

  const handleExportResults = async () => {
    try {
      const results = await exoplanetAPI.exportResults();
      
      // Create and download JSON file
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exoplanet-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <ConnectionStatus />
      {/* Header estilo Vercel */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Kepler AI Lab</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModelSelector 
                onModelChange={handleModelChange} 
                refreshTrigger={modelRefreshTrigger}
              />
              <button 
                onClick={handleExportResults}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Export Results
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'visualization' && (
            <motion.div
              key="visualization"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100vh-200px)]"
            >
              <GalaxyScene />
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DataUpload onDataUploaded={fetchModelStats} />
            </motion.div>
          )}

          {activeTab === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ModelTraining 
                onTrainingStart={() => setIsTraining(true)}
                onTrainingComplete={() => {
                  setIsTraining(false);
                  fetchModelStats();
                }}
                onModelTrained={handleModelTrained}
                progress={trainingProgress}
                setProgress={setTrainingProgress}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ModelStats stats={modelStats} />
            </motion.div>
          )}

          {activeTab === 'tuning' && (
            <motion.div
              key="tuning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HyperparameterTuning onParametersChanged={fetchModelStats} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Training Progress Bar */}
      <AnimatePresence>
        {isTraining && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Training Model...</span>
                <span className="text-sm text-gray-500">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-black h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${trainingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </NotificationProvider>
  );
}
