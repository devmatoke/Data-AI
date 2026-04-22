import React from 'react';
import { Table, FileText, Info } from 'lucide-react';

const DataPreview = ({ data }) => {
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  const displayData = data.data.slice(0, 10); // Show first 10 rows
  const columns = data.columns || Object.keys(displayData[0] || {});

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Table className="w-5 h-5" />
          <span>Data Preview</span>
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>{data.originalname}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Info className="w-4 h-4" />
            <span>{data.totalRows} rows, {columns.length} columns</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column] !== null && row[column] !== undefined
                      ? String(row[column])
                      : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalRows > 10 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing first 10 of {data.totalRows} rows
        </div>
      )}
    </div>
  );
};

export default DataPreview;
