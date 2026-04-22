import React, { useState } from 'react';
import { Download, Code, FileSpreadsheet, Eye, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ResultsDisplay = ({ results }) => {
  const [showCode, setShowCode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  if (!results || !results.result) {
    return null;
  }

  const { result, generatedCode } = results;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownload = () => {
    if (result.type === 'excel' && result.downloadUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${result.downloadUrl}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderVisualization = () => {
    if (result.visualization) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Visualization</h4>
          <img 
            src={`data:image/png;base64,${result.visualization}`}
            alt="Data visualization"
            className="w-full rounded-lg border border-gray-200"
          />
        </div>
      );
    }
    return null;
  };

  const renderSummary = () => {
    if (result.summary) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
          <p className="text-gray-600">{result.summary}</p>
        </div>
      );
    }
    return null;
  };

  const renderStatistics = () => {
    if (result.summary && typeof result.summary === 'object') {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Shape:</span>
                <span className="ml-2 text-gray-900">
                  {result.shape ? `${result.shape[0]} rows × ${result.shape[1]} columns` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Columns:</span>
                <span className="ml-2 text-gray-900">
                  {result.columns ? result.columns.length : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>Analysis Results</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          {result.type === 'excel' && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel</span>
            </button>
          )}
          
          {generatedCode && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>{showCode ? 'Hide' : 'Show'} Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-4">
        {renderSummary()}
        {renderStatistics()}
        {renderVisualization()}

        {/* Expandable sections for detailed data */}
        {result.summary && typeof result.summary === 'object' && Object.keys(result.summary).length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('details')}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {expandedSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Detailed Statistics</span>
            </button>
            
            {expandedSections.details && (
              <div className="mt-2 bg-gray-50 rounded-lg p-4 overflow-x-auto custom-scrollbar">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result.summary, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated Code Display */}
      {showCode && generatedCode && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Generated Python Code</span>
          </h3>
          <div className="rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language="python"
              style={tomorrow}
              customStyle={{
                margin: 0,
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}
            >
              {generatedCode}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
