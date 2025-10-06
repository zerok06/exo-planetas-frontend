import React from 'react';
import { motion } from 'framer-motion';

export default function PlanetInfoPanel({ 
  planet, 
  prediction, 
  isLoading, 
  onClose 
}) {
  if (!planet) {
    return (
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-80 h-full bg-gray-900 bg-opacity-90 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto"
      >
        <div className="text-center text-gray-400 mt-20">
          <div className="text-6xl mb-4">🌌</div>
          <h3 className="text-xl font-semibold mb-2">Exoplanet Explorer</h3>
          <p className="text-sm">Click on a planet to view its details and get ML predictions</p>
        </div>
      </motion.div>
    );
  }

  const getPredictionColor = (prediction) => {
    if (!prediction) return 'text-gray-400';
    return prediction.prediction === 'CONFIRMED' ? 'text-green-400' : 'text-yellow-400';
  };

  const getPredictionIcon = (prediction) => {
    if (!prediction) return '❓';
    return prediction.prediction === 'CONFIRMED' ? '✅' : '🔍';
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 h-full bg-gray-900 bg-opacity-90 backdrop-blur-sm border-l border-gray-700 p-6 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Planet Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Planet Name */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {planet.koi_name || 'Unknown Planet'}
        </h3>
        <div className="text-sm text-gray-400">
          Kepler Object of Interest
        </div>
      </div>

      {/* Prediction Status */}
      <div className="mb-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">ML Prediction</span>
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          ) : (
            <span className="text-2xl">
              {getPredictionIcon(prediction)}
            </span>
          )}
        </div>
        
        {prediction && (
          <div className={`text-lg font-semibold ${getPredictionColor(prediction)}`}>
            {prediction.prediction}
          </div>
        )}
        
        {prediction && (
          <div className="text-sm text-gray-400 mt-1">
            Confidence: {(prediction.confidence * 100).toFixed(1)}%
          </div>
        )}
        
        {!prediction && !isLoading && (
          <div className="text-sm text-gray-400">
            Click "Predict" to get ML classification
          </div>
        )}
      </div>

      {/* Physical Properties */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Physical Properties</h4>
        
        <div className="space-y-3">
          {planet.koi_period && (
            <div className="flex justify-between">
              <span className="text-gray-400">Orbital Period</span>
              <span className="text-white">{planet.koi_period.toFixed(2)} days</span>
            </div>
          )}
          
          {planet.koi_depth && (
            <div className="flex justify-between">
              <span className="text-gray-400">Transit Depth</span>
              <span className="text-white">{(planet.koi_depth * 1000).toFixed(3)} ppm</span>
            </div>
          )}
          
          {planet.koi_duration && (
            <div className="flex justify-between">
              <span className="text-gray-400">Transit Duration</span>
              <span className="text-white">{planet.koi_duration.toFixed(2)} hours</span>
            </div>
          )}
          
          {planet.koi_impact && (
            <div className="flex justify-between">
              <span className="text-gray-400">Impact Parameter</span>
              <span className="text-white">{planet.koi_impact.toFixed(3)}</span>
            </div>
          )}
          
          {planet.koi_model_snr && (
            <div className="flex justify-between">
              <span className="text-gray-400">Signal-to-Noise</span>
              <span className="text-white">{planet.koi_model_snr.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stellar Properties */}
      {(planet.koi_steff || planet.koi_srad) && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Stellar Properties</h4>
          
          <div className="space-y-3">
            {planet.koi_steff && (
              <div className="flex justify-between">
                <span className="text-gray-400">Stellar Temperature</span>
                <span className="text-white">{planet.koi_steff.toFixed(0)} K</span>
              </div>
            )}
            
            {planet.koi_srad && (
              <div className="flex justify-between">
                <span className="text-gray-400">Stellar Radius</span>
                <span className="text-white">{planet.koi_srad.toFixed(2)} R☉</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coordinates */}
      {(planet.ra || planet.dec) && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Coordinates</h4>
          
          <div className="space-y-3">
            {planet.ra && (
              <div className="flex justify-between">
                <span className="text-gray-400">Right Ascension</span>
                <span className="text-white">{planet.ra.toFixed(3)}°</span>
              </div>
            )}
            
            {planet.dec && (
              <div className="flex justify-between">
                <span className="text-gray-400">Declination</span>
                <span className="text-white">{planet.dec.toFixed(3)}°</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Bars */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Measurement Errors</h4>
        
        <div className="space-y-3 text-sm">
          {planet.koi_period_err1 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Period Error</span>
              <span className="text-white">±{planet.koi_period_err1.toFixed(3)}</span>
            </div>
          )}
          
          {planet.koi_depth_err1 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Depth Error</span>
              <span className="text-white">±{(planet.koi_depth_err1 * 1000).toFixed(3)} ppm</span>
            </div>
          )}
          
          {planet.koi_duration_err1 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Duration Error</span>
              <span className="text-white">±{planet.koi_duration_err1.toFixed(3)} h</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
