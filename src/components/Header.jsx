import React from 'react';
import { motion } from 'framer-motion';

export default function Header({ 
  totalPlanets, 
  confirmedCount, 
  candidateCount, 
  isLoading 
}) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-gray-700 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="text-3xl">🌌</div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Exoplanet Explorer
            </h1>
            <p className="text-sm text-gray-400">
              NASA Kepler Data Visualization & ML Classification
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {totalPlanets}
            </div>
            <div className="text-xs text-gray-400">Total Planets</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {confirmedCount}
            </div>
            <div className="text-xs text-gray-400">Confirmed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {candidateCount}
            </div>
            <div className="text-xs text-gray-400">Candidates</div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="text-sm text-gray-400">Analyzing...</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="hidden md:block text-right">
          <div className="text-sm text-gray-400">
            Click planets to explore • Rotate to navigate • Zoom to focus
          </div>
        </div>
      </div>
    </motion.header>
  );
}

