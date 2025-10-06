import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { exoplanetAPI } from '../services/api';
import { useNotifications } from './NotificationSystem';

export default function DataUpload({ onDataUploaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { success, error, warning, info } = useNotifications();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, []);

  const handleFileInput = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    await handleFiles(files);
  }, []);

  const validateColumns = (data) => {
    // Columnas requeridas para features (X)
    const requiredFeatures = [
      'koi_period_err1', 'koi_period_err2', 'koi_time0bk', 'koi_time0bk_err1', 
      'koi_time0bk_err2', 'koi_impact', 'koi_duration', 'koi_duration_err1', 
      'koi_duration_err2', 'koi_depth', 'koi_depth_err1', 'koi_model_snr', 
      'koi_steff_err1', 'koi_srad_err1', 'delivname_q1_q16_tce', 
      'delivname_q1_q17_dr24_tce', 'delivname_q1_q17_dr25_tce'
    ];
    
    // Columna requerida para target (Y)
    const requiredTarget = ['koi_disposition']; // o 'target', 'label', etc.
    
    const dataColumns = Object.keys(data);
    const missingFeatures = requiredFeatures.filter(col => !dataColumns.includes(col));
    const hasTarget = requiredTarget.some(target => dataColumns.includes(target));
    
    return {
      isValid: missingFeatures.length === 0 && hasTarget,
      missingFeatures,
      hasTarget,
      foundFeatures: dataColumns.filter(col => requiredFeatures.includes(col)),
      foundTarget: dataColumns.filter(col => requiredTarget.includes(col))
    };
  };

  const handleFiles = async (files) => {
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    info('Upload Started', `Processing ${files.length} file(s)...`);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar archivo antes de subir
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              throw new Error('File must contain at least a header row and one data row');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            // Crear objeto de datos para validación
            const sampleData = {};
            headers.forEach(header => {
              sampleData[header] = 'sample';
            });
            
            const validation = validateColumns(sampleData);
            
            if (!validation.isValid) {
              setUploadedFiles(prev => [...prev, {
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'error',
                error: `Missing columns: ${validation.missingFeatures.join(', ')}. Target required: ${validation.hasTarget ? 'Found' : 'Not found'}`,
                id: Date.now() + i
              }]);
              errorCount++;
              error('Validation Failed', `${file.name}: Missing required columns`);
              continue;
            }
          } catch (validationError) {
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              size: file.size,
              type: file.type,
              status: 'error',
              error: `File validation error: ${validationError.message}`,
              id: Date.now() + i
            }]);
            errorCount++;
            error('File Error', `${file.name}: ${validationError.message}`);
            continue;
          }
        }
        
        // Simulate file processing
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + Math.random() * 10;
          });
        }, 200);

        try {
          // Upload file
          const response = await exoplanetAPI.uploadData(formData);
          
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'success',
            id: Date.now() + i
          }]);

          successCount++;
          success('Upload Success', `${file.name} uploaded successfully`);

        } catch (uploadError) {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'error',
            error: uploadError.message,
            id: Date.now() + i
          }]);
          errorCount++;
          error('Upload Failed', `${file.name}: ${uploadError.message}`);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      // Summary notification
      if (successCount > 0 && errorCount === 0) {
        success('Upload Complete', `All ${successCount} file(s) uploaded successfully`);
      } else if (successCount > 0 && errorCount > 0) {
        warning('Upload Partial', `${successCount} successful, ${errorCount} failed`);
      } else {
        error('Upload Failed', 'No files were uploaded successfully');
      }

      // Notify parent component
      if (onDataUploaded && successCount > 0) {
        onDataUploaded();
      }

    } catch (error) {
      console.error('Upload failed:', error);
      error('Upload Error', 'An unexpected error occurred during upload');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data Upload</h2>
        <p className="text-gray-600 mt-1">Upload new exoplanet datasets to improve model accuracy</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".csv,.json,.xlsx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <motion.div
          animate={{ scale: isDragOver ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-gray-500">
            Supports CSV, JSON, and Excel files
          </p>
        </motion.div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-black h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Uploading... {Math.round(uploadProgress)}%</p>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    file.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-sm ${
                      file.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {file.status === 'success' ? '✓' : '✗'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    file.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {file.status === 'success' ? 'Processed' : 'Error'}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Requirements</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Required Features (X):</strong></p>
            <div className="ml-4 text-xs">
              <p>• koi_period_err1, koi_period_err2, koi_time0bk, koi_time0bk_err1, koi_time0bk_err2</p>
              <p>• koi_impact, koi_duration, koi_duration_err1, koi_duration_err2</p>
              <p>• koi_depth, koi_depth_err1, koi_model_snr, koi_steff_err1, koi_srad_err1</p>
              <p>• delivname_q1_q16_tce, delivname_q1_q17_dr24_tce, delivname_q1_q17_dr25_tce</p>
            </div>
            <p><strong>Required Target (Y):</strong></p>
            <div className="ml-4 text-xs">
              <p>• koi_disposition (or target, label)</p>
            </div>
            <p><strong>Supported Formats:</strong></p>
            <div className="ml-4 text-xs">
              <p>• CSV files: Comma-separated values with headers</p>
              <p>• JSON files: Array of exoplanet objects</p>
              <p>• Excel files: Multiple sheets supported</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

