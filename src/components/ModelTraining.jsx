import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { exoplanetAPI } from '../services/api';
import { useNotifications } from './NotificationSystem';

export default function ModelTraining({ onTrainingStart, onTrainingComplete, progress, setProgress, onModelTrained }) {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState({
    algorithm: 'lightgbm',
    testSize: 0.2,
    randomState: 42,
    crossValidation: 5
  });
  const [trainingHistory, setTrainingHistory] = useState([]);
  const { success, error, warning, info } = useNotifications();

  const algorithms = [
    { id: 'lightgbm', name: 'LightGBM', description: 'Gradient boosting framework' },
    { id: 'random_forest', name: 'Random Forest', description: 'Ensemble learning method' },
    { id: 'xgboost', name: 'XGBoost', description: 'Extreme gradient boosting' },
    { id: 'svm', name: 'SVM', description: 'Support Vector Machine' }
  ];

  const startTraining = async () => {
    setIsTraining(true);
    onTrainingStart();
    info('Training Started', `Starting ${trainingConfig.algorithm} training...`);
    
    try {
      // Simulate training progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 500);

      const result = await exoplanetAPI.trainModel(trainingConfig);
      
      clearInterval(progressInterval);
      
      const trainingSession = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        algorithm: trainingConfig.algorithm,
        accuracy: result.accuracy,
        f1Score: result.f1_score,
        duration: result.duration || result.training_time
      };
      
      setTrainingHistory(prev => [trainingSession, ...prev]);

      success('Training Complete', `Model trained successfully with ${(result.accuracy * 100).toFixed(1)}% accuracy`);
      
      // Notify parent about new model
      if (onModelTrained) {
        onModelTrained(result);
      }
      
      onTrainingComplete();
      
    } catch (error) {
      console.error('Training failed:', error);
      error('Training Failed', error.message || 'An error occurred during training');
    } finally {
      setIsTraining(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Model Training</h2>
        <p className="text-gray-600 mt-1">Train and retrain your exoplanet classification model</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Training Configuration</h3>
          
          <div className="space-y-4">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Algorithm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {algorithms.map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => setTrainingConfig(prev => ({ ...prev, algorithm: algo.id }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      trainingConfig.algorithm === algo.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{algo.name}</div>
                    <div className="text-xs text-gray-500">{algo.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Size: {trainingConfig.testSize}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={trainingConfig.testSize}
                onChange={(e) => setTrainingConfig(prev => ({ ...prev, testSize: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Cross Validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cross Validation Folds: {trainingConfig.crossValidation}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={trainingConfig.crossValidation}
                onChange={(e) => setTrainingConfig(prev => ({ ...prev, crossValidation: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Random State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Random State
              </label>
              <input
                type="number"
                value={trainingConfig.randomState}
                onChange={(e) => setTrainingConfig(prev => ({ ...prev, randomState: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>

            {/* Start Training Button */}
            <button
              onClick={startTraining}
              disabled={isTraining}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isTraining
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isTraining ? 'Training...' : 'Start Training'}
            </button>
          </div>
        </div>

        {/* Training Progress & History */}
        <div className="space-y-6">
          {/* Current Training Progress */}
          {isTraining && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Training Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-black h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Algorithm:</span>
                    <span className="ml-2 font-medium">{trainingConfig.algorithm}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Test Size:</span>
                    <span className="ml-2 font-medium">{trainingConfig.testSize}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Training History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Training History</h3>
            
            {trainingHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No training sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trainingHistory.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{session.algorithm}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Accuracy: {(session.accuracy * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        F1: {session.f1Score.toFixed(3)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
