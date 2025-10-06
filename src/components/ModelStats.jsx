import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { exoplanetAPI } from '../services/api';

export default function ModelStats({ stats }) {
  const [modelStats, setModelStats] = useState(stats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stats) {
      setModelStats(stats);
    } else {
      fetchStats();
    }
  }, [stats]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await exoplanetAPI.getModelStats();
      setModelStats(response);
    } catch (error) {
      console.error('Failed to fetch model stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!modelStats) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Model Statistics</h3>
        <p className="text-gray-600">Train a model to see statistics</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Accuracy',
      value: `${(modelStats.accuracy * 100).toFixed(1)}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '🎯'
    },
    {
      label: 'Precision',
      value: `${(modelStats.precision * 100).toFixed(1)}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '🎯'
    },
    {
      label: 'Recall',
      value: `${(modelStats.recall * 100).toFixed(1)}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '🔍'
    },
    {
      label: 'F1 Score',
      value: modelStats.f1_score.toFixed(3),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '⚖️'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Statistics</h2>
          <p className="text-gray-600 mt-1">Performance metrics and model insights</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bgColor} rounded-lg p-6`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confusion Matrix</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div></div>
              <div className="text-center font-medium">Predicted</div>
              <div></div>
              <div className="text-center font-medium">Actual</div>
              <div className="text-center font-medium text-gray-600">CANDIDATE</div>
              <div className="text-center font-medium text-gray-600">CONFIRMED</div>
              <div className="text-center font-medium text-gray-600">CANDIDATE</div>
              <div className="text-center p-2 bg-green-100 text-green-800 rounded">
                {modelStats.confusion_matrix?.true_negatives || 0}
              </div>
              <div className="text-center p-2 bg-red-100 text-red-800 rounded">
                {modelStats.confusion_matrix?.false_positives || 0}
              </div>
              <div className="text-center font-medium text-gray-600">CONFIRMED</div>
              <div className="text-center p-2 bg-red-100 text-red-800 rounded">
                {modelStats.confusion_matrix?.false_negatives || 0}
              </div>
              <div className="text-center p-2 bg-green-100 text-green-800 rounded">
                {modelStats.confusion_matrix?.true_positives || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Model Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Model Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Algorithm:</span>
              <span className="font-medium">{modelStats.algorithm || 'LightGBM'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Training Date:</span>
              <span className="font-medium">
                {new Date(modelStats.training_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Training Time:</span>
              <span className="font-medium">{modelStats.training_time || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-medium">{modelStats.data_points || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Features:</span>
              <span className="font-medium">{modelStats.feature_count || 17}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      {modelStats.feature_importance && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Importance</h3>
          <div className="space-y-2">
            {modelStats.feature_importance.slice(0, 10).map((feature, index) => (
              <div key={feature.name} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${feature.importance * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {(feature.importance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

