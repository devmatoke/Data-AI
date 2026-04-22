import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import DataPreview from './components/DataPreview';
import AnalysisPanel from './components/AnalysisPanel';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dataPreview, setDataPreview] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (fileData) => {
    setUploadedFile(fileData);
    setDataPreview(fileData);
    setAnalysisResults(null);
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
    setIsLoading(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Data AI Platform</h1>
            </div>
            <p className="text-sm text-gray-600">AI-powered data analysis with Python & Excel</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Analysis */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            {uploadedFile && (
              <AnalysisPanel
                uploadedFile={uploadedFile}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Column - Data Preview and Results */}
          <div className="lg:col-span-2 space-y-6">
            {dataPreview && (
              <DataPreview data={dataPreview} />
            )}
            {analysisResults && (
              <ResultsDisplay results={analysisResults} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
