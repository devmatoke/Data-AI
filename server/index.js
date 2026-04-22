const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { VM } = require('vm2');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/temp', express.static('temp'));

// Ensure temp directory exists
const tempDir = 'temp/';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let data = [];

    if (fileExt === '.csv') {
      // Parse CSV
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => {
          data = results;
          res.json({
            success: true,
            filename: req.file.filename,
            originalname: req.file.originalname,
            data: data.slice(0, 100), // Send first 100 rows for preview
            totalRows: results.length,
            columns: results.length > 0 ? Object.keys(results[0]) : []
          });
        });
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      // Parse Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
      
      res.json({
        success: true,
        filename: req.file.filename,
        originalname: req.file.originalname,
        data: data.slice(0, 100), // Send first 100 rows for preview
        totalRows: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : []
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { filename, query, analysisType } = req.body;
    
    if (!filename || !query || !analysisType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Read the uploaded file
    const filePath = path.join('uploads', filename);
    let data = [];
    const fileExt = path.extname(filename).toLowerCase();

    if (fileExt === '.csv') {
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
      data = results;
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    // Generate code based on analysis type
    let generatedCode;
    let result;

    if (analysisType === 'python') {
      generatedCode = await generatePythonCode(query, data);
      result = await executePythonCode(generatedCode, data);
    } else if (analysisType === 'excel') {
      result = await generateExcelAnalysis(query, data, filename);
    }

    res.json({
      success: true,
      result: result,
      generatedCode: analysisType === 'python' ? generatedCode : null
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

async function generatePythonCode(query, data) {
  // This would integrate with an AI model (OpenAI, Claude, etc.)
  // For now, providing a template-based approach
  
  const columns = Object.keys(data[0] || {});
  const sampleData = JSON.stringify(data.slice(0, 5));
  
  const prompt = `
You are a data analysis expert. Given the following dataset and user query, generate Python code to perform the analysis.

Dataset columns: ${columns.join(', ')}
Sample data: ${sampleData}
User query: "${query}"

Generate Python code using pandas, numpy, and matplotlib that:
1. Loads the data (already available as 'data' variable)
2. Performs the requested analysis
3. Creates visualizations if appropriate
4. Returns results in a dictionary format

Code should be complete and executable. Return only the code without explanations.
`;

  // For demo purposes, return a basic template
  // In production, this would call an AI API
  return `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
import io
import base64

# Data is already available as 'data' variable
df = pd.DataFrame(data)

# Basic analysis based on common patterns
results = {
    'summary': df.describe().to_dict(),
    'shape': df.shape,
    'columns': df.columns.tolist(),
    'dtypes': df.dtypes.to_dict()
}

# Generate visualization
plt.figure(figsize=(10, 6))
if len(df.select_dtypes(include=[np.number]).columns) > 0:
    df.select_dtypes(include=[np.number]).hist()
    plt.tight_layout()
    
    # Save plot to base64
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight')
    img_buffer.seek(0)
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    results['visualization'] = img_base64

plt.close()

# Return results
results_json = json.dumps(results)
`;
}

async function executePythonCode(code, data) {
  const vm = new VM({
    timeout: 30000,
    sandbox: {
      data: data,
      console: {
        log: (...args) => console.log('Python VM:', ...args)
      },
      require: (moduleName) => {
        // Allow specific safe modules
        const allowedModules = ['pandas', 'numpy', 'matplotlib', 'json', 'io', 'base64'];
        if (allowedModules.includes(moduleName)) {
          return require(moduleName);
        }
        throw new Error(`Module ${moduleName} is not allowed`);
      }
    }
  });

  try {
    const result = vm.run(`
      ${code}
      results_json
    `);
    
    return JSON.parse(result);
  } catch (error) {
    throw new Error('Python execution failed: ' + error.message);
  }
}

async function generateExcelAnalysis(query, data, originalFilename) {
  // Create a new Excel file with analysis
  const wb = XLSX.utils.book_new();
  
  // Add original data
  const ws1 = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws1, 'Original Data');
  
  // Add summary sheet
  const summaryData = [];
  const df = data;
  
  // Basic statistics
  summaryData.push(['Analysis Summary', '']);
  summaryData.push(['Total Rows', data.length]);
  summaryData.push(['Total Columns', Object.keys(data[0] || {}).length]);
  summaryData.push(['', '']);
  
  // Column analysis
  if (data.length > 0) {
    Object.keys(data[0]).forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== '');
      summaryData.push([col, `Count: ${values.length}, Unique: ${[...new Set(values)].length}`]);
    });
  }
  
  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
  
  // Save the file
  const timestamp = Date.now();
  const outputFilename = `analysis_${timestamp}_${originalFilename}`;
  const outputPath = path.join('temp', outputFilename);
  
  XLSX.writeFile(wb, outputPath);
  
  return {
    downloadUrl: `/temp/${outputFilename}`,
    filename: outputFilename,
    summary: 'Excel analysis completed with summary statistics',
    type: 'excel'
  };
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
