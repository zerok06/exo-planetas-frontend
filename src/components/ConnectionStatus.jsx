import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exoplanetAPI } from '../services/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await exoplanetAPI.checkHealth();
      setIsConnected(true);
      setLastCheck(new Date());
    } catch (error) {
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-500';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    return isConnected ? '🟢' : '🔴';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-4 z-40"
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center space-x-2">
            <div className={`text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div>
              <div className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              {lastCheck && (
                <div className="text-xs text-gray-500">
                  Last check: {lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Check connection"
            >
              <svg 
                className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

