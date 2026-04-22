import React, { useState } from 'react';
import { Brain, Code, FileSpreadsheet, Play, Loader2 } from 'lucide-react';

const AnalysisPanel = ({ uploadedFile, onAnalysisStart, onAnalysisComplete, isLoading }) => {
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState('python');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      alert('Please enter a description of what you want to analyze');
      return;
    }

    onAnalysisStart();

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: uploadedFile.filename,
          query: query,
          analysisType: analysisType
        }),
      });

      const result = await response.json();

      if (result.success) {
        onAnalysisComplete(result);
      } else {
        alert('Analysis failed: ' + result.error);
        onAnalysisComplete(null);
      }
    } catch (error) {
      alert('Analysis failed: ' + error.message);
      onAnalysisComplete(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Brain className="w-5 h-5" />
        <span>AI Analysis</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Analysis Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analysis Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAnalysisType('python')}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                analysisType === 'python'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Code className="w-5 h-5" />
              <span className="font-medium">Python</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAnalysisType('excel')}
              className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                analysisType === 'excel'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium">Excel</span>
            </button>
          </div>
        </div>

        {/* Query Input */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to analyze?
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your analysis in natural language. For example: 'Show me summary statistics for all numeric columns' or 'Create a histogram of the sales data'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={isLoading}
          />
        </div>

        {/* Analysis Type Description */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p className="text-gray-600">
            {analysisType === 'python' 
              ? 'Python analysis will generate and execute code using pandas, numpy, and matplotlib for advanced data analysis and visualization.'
              : 'Excel analysis will create a downloadable Excel file with formulas, pivot tables, and summary statistics.'}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start Analysis</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AnalysisPanel;
