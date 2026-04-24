# Data AI Platform

A full-stack web application that allows users to upload datasets and perform AI-powered data analysis using either Python or Excel execution modes.

## Features

- **File Upload**: Support for CSV and Excel files (XLSX, XLS)
- **Data Preview**: Interactive preview of uploaded datasets
- **AI Analysis**: Natural language to code/formula conversion
- **Dual Execution Modes**:
  - Python mode with pandas, numpy, and matplotlib
  - Excel mode with formulas and pivot tables
- **Visualizations**: Automatic chart generation
- **Downloadable Results**: Export processed data and analysis
- **Modern UI**: Responsive React frontend with Tailwind CSS
- **Security**: Sandboxed code execution and input validation

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Lucide React (icons)
- React Dropzone
- Recharts
- React Syntax Highlighter

### Backend
- Node.js with Express
- Multer for file uploads
- VM2 for sandboxed Python execution
- XLSX for Excel file generation
- Helmet for security
- Rate limiting

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Data-AI
```

2. Install dependencies:
```bash
npm run install-deps
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000) concurrently.

### Manual Start

To start servers individually:

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm start
```

## Usage

1. **Upload Data**: Drag and drop or browse to upload a CSV or Excel file
2. **Preview Data**: View the first 10 rows of your dataset
3. **Choose Analysis Type**: Select Python or Excel mode
4. **Describe Analysis**: Enter what you want to analyze in natural language
5. **View Results**: See generated visualizations, statistics, and download results

## API Endpoints

### POST /api/upload
Uploads and parses a dataset file.

**Request:** FormData with 'file' field
**Response:** 
```json
{
  "success": true,
  "filename": "generated-filename.csv",
  "originalname": "user-filename.csv",
  "data": [...], // First 100 rows
  "totalRows": 1000,
  "columns": ["col1", "col2", ...]
}
```

### POST /api/analyze
Performs AI analysis on uploaded data.

**Request:**
```json
{
  "filename": "uploaded-file.csv",
  "query": "Show me summary statistics",
  "analysisType": "python" // or "excel"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "summary": {...},
    "visualization": "base64-image",
    "type": "python"
  },
  "generatedCode": "python-code-string"
}
```

## Security Features

- File type validation
- File size limits (10MB)
- Sandboxed code execution using VM2
- Rate limiting
- Input sanitization
- Helmet security headers

## AI Integration

The platform supports AI model integration for natural language to code conversion. Currently configured for:

- OpenAI API (GPT models)
- Anthropic API (Claude models)

Configure your preferred AI provider in the `.env` file.

## Development

### Adding New Analysis Types

To add new analysis types:

1. Update the frontend `AnalysisPanel.js` to include the new type
2. Add corresponding logic in `server/index.js`:
   - Update `generatePythonCode()` or create new generator
   - Update `executePythonCode()` for new execution patterns
   - Add new result handling in `/api/analyze` endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Common Issues

**Tailwind CSS not working:**
- Ensure PostCSS and Tailwind config files are present
- Restart the development server

**File upload failing:**
- Check file size (max 10MB)
- Verify file type (CSV, XLSX, XLS only)
- Check uploads directory permissions

**Python execution errors:**
- Review generated code for security violations
- Check VM2 sandbox configuration
- Verify required Python packages are available

**Excel download not working:**
- Ensure temp directory exists and is writable
- Check file permissions
- Verify CORS settings
