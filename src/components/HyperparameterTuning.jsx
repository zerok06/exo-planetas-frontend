import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { exoplanetAPI } from '../services/api';

export default function HyperparameterTuning({ onParametersChanged }) {
  const [parameters, setParameters] = useState({
    learning_rate: 0.1,
    num_leaves: 31,
    max_depth: -1,
    min_data_in_leaf: 20,
    feature_fraction: 0.9,
    bagging_fraction: 0.8,
    bagging_freq: 5,
    lambda_l1: 0,
    lambda_l2: 0,
    min_gain_to_split: 0,
    min_sum_hessian_in_leaf: 1e-3
  });

  const [tuningHistory, setTuningHistory] = useState([]);
  const [isTuning, setIsTuning] = useState(false);
  const [bestScore, setBestScore] = useState(null);

  const parameterGroups = [
    {
      title: 'Basic Parameters',
      parameters: [
        { key: 'learning_rate', label: 'Learning Rate', min: 0.01, max: 0.3, step: 0.01, description: 'Controls the step size' },
        { key: 'num_leaves', label: 'Number of Leaves', min: 10, max: 100, step: 1, description: 'Maximum number of leaves' },
        { key: 'max_depth', label: 'Max Depth', min: -1, max: 20, step: 1, description: 'Maximum tree depth (-1 for no limit)' },
        { key: 'min_data_in_leaf', label: 'Min Data in Leaf', min: 1, max: 100, step: 1, description: 'Minimum data points in a leaf' }
      ]
    },
    {
      title: 'Feature & Bagging',
      parameters: [
        { key: 'feature_fraction', label: 'Feature Fraction', min: 0.1, max: 1.0, step: 0.05, description: 'Fraction of features to use' },
        { key: 'bagging_fraction', label: 'Bagging Fraction', min: 0.1, max: 1.0, step: 0.05, description: 'Fraction of data for bagging' },
        { key: 'bagging_freq', label: 'Bagging Frequency', min: 0, max: 10, step: 1, description: 'Frequency of bagging' }
      ]
    },
    {
      title: 'Regularization',
      parameters: [
        { key: 'lambda_l1', label: 'L1 Regularization', min: 0, max: 10, step: 0.1, description: 'L1 regularization strength' },
        { key: 'lambda_l2', label: 'L2 Regularization', min: 0, max: 10, step: 0.1, description: 'L2 regularization strength' },
        { key: 'min_gain_to_split', label: 'Min Gain to Split', min: 0, max: 1, step: 0.01, description: 'Minimum gain to split' },
        { key: 'min_sum_hessian_in_leaf', label: 'Min Sum Hessian', min: 0.001, max: 1, step: 0.001, description: 'Minimum sum of hessian in leaf' }
      ]
    }
  ];

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const startTuning = async () => {
    setIsTuning(true);
    try {
      const result = await exoplanetAPI.tuneHyperparameters(parameters);
      
      setTuningHistory(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        parameters: { ...parameters },
        score: result.score,
        accuracy: result.accuracy,
        f1_score: result.f1_score
      }, ...prev]);

      if (!bestScore || result.score > bestScore.score) {
        setBestScore({
          score: result.score,
          parameters: { ...parameters },
          timestamp: new Date().toISOString()
        });
      }

      if (onParametersChanged) {
        onParametersChanged();
      }

    } catch (error) {
      console.error('Hyperparameter tuning failed:', error);
    } finally {
      setIsTuning(false);
    }
  };

  const resetToDefaults = () => {
    setParameters({
      learning_rate: 0.1,
      num_leaves: 31,
      max_depth: -1,
      min_data_in_leaf: 20,
      feature_fraction: 0.9,
      bagging_fraction: 0.8,
      bagging_freq: 5,
      lambda_l1: 0,
      lambda_l2: 0,
      min_gain_to_split: 0,
      min_sum_hessian_in_leaf: 1e-3
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hyperparameter Tuning</h2>
          <p className="text-gray-600 mt-1">Optimize model performance by adjusting parameters</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={startTuning}
            disabled={isTuning}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isTuning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isTuning ? 'Tuning...' : 'Start Tuning'}
          </button>
        </div>
      </div>

      {/* Best Score Display */}
      {bestScore && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-lg">🏆</span>
            <div>
              <div className="font-medium text-green-900">Best Score: {bestScore.score.toFixed(4)}</div>
              <div className="text-sm text-green-700">
                Achieved on {new Date(bestScore.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameter Controls */}
        <div className="lg:col-span-2 space-y-6">
          {parameterGroups.map((group, groupIndex) => (
            <div key={group.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{group.title}</h3>
              <div className="space-y-4">
                {group.parameters.map((param) => (
                  <div key={param.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {param.label}
                      </label>
                      <span className="text-sm text-gray-500">
                        {parameters[param.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={parameters[param.key]}
                      onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tuning History & Results */}
        <div className="space-y-6">
          {/* Current Parameters Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Parameters</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Learning Rate:</span>
                <span className="font-medium">{parameters.learning_rate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Num Leaves:</span>
                <span className="font-medium">{parameters.num_leaves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Depth:</span>
                <span className="font-medium">{parameters.max_depth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Feature Fraction:</span>
                <span className="font-medium">{parameters.feature_fraction}</span>
              </div>
            </div>
          </div>

          {/* Tuning History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tuning History</h3>
            {tuningHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">⚙️</div>
                <p>No tuning sessions yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {tuningHistory.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">Score: {session.score.toFixed(4)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Accuracy: {(session.accuracy * 100).toFixed(1)}% | 
                      F1: {session.f1_score.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Presets</h3>
            <div className="space-y-2">
              <button
                onClick={() => setParameters(prev => ({ ...prev, learning_rate: 0.05, num_leaves: 50 }))}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                Conservative (Low Learning Rate)
              </button>
              <button
                onClick={() => setParameters(prev => ({ ...prev, learning_rate: 0.2, num_leaves: 20 }))}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                Aggressive (High Learning Rate)
              </button>
              <button
                onClick={() => setParameters(prev => ({ ...prev, lambda_l1: 1, lambda_l2: 1 }))}
                className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                Regularized (L1 + L2)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

