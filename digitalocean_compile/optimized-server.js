const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

// Add queue to prevent overload
let isCompiling = false;
const queue = [];
let currentChild = null;

// Simple in-memory cache
const cache = new Map();
const CACHE_DIR = '/tmp/latex-cache';

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

app.use(cors());
app.use(bodyParser.text({ type: 'text/plain', limit: '10mb' }));

app.post('/compile', (req, res) => {
  console.log('==== COMPILE REQUEST RECEIVED ====');
  
  // Add to queue if already compiling
  if (isCompiling) {
    console.log('Request queued - already compiling');
    queue.push({ req, res });
    return;
  }
  
  isCompiling = true;
  const texContent = req.body;
  
  // Check cache first
  const contentHash = crypto.createHash('md5').update(texContent).digest('hex');
  const cacheFile = path.join(CACHE_DIR, `${contentHash}.pdf`);
  
  if (fs.existsSync(cacheFile)) {
    console.log('Serving from cache');
    const pdfBuffer = fs.readFileSync(cacheFile);
    res.set('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
    isCompiling = false;
    processNextInQueue();
    return;
  }
  
  // Log the first 100 chars of the content
  console.log(`TeX content received (first 100 chars): ${texContent.substring(0, 100)}...`);
  console.log(`Content length: ${texContent.length} bytes`);
  
  // Add timeout to prevent hanging processes
  const timeout = setTimeout(() => {
    console.log('Compilation timeout - killing process');
    if (currentChild) {
      currentChild.kill('SIGKILL');
      currentChild = null;
    }
    res.status(500).json({ error: 'Compilation timeout' });
    isCompiling = false;
    processNextInQueue();
  }, 30000); // 30 second timeout
  
  console.log('Spawning LaTeX compilation process...');
  currentChild = exec('/opt/latex-service/run-latex.sh', { 
    encoding: 'buffer',
    timeout: 25000 // 25 second timeout
  });
  
  currentChild.stdin.write(texContent);
  currentChild.stdin.end();
  console.log('TeX content sent to compiler');
  
  let pdfData = [];
  let errorData = [];
  
  currentChild.stdout.on('data', (data) => {
    console.log(`Received stdout chunk: ${data.length} bytes`);
    console.log(`Is Buffer: ${Buffer.isBuffer(data)}`);
    // First 20 bytes as hex for debugging
    console.log(`First 20 bytes: ${data.slice(0, 20).toString('hex')}`);
    
    // Ensure data is a Buffer before pushing to array
    pdfData.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
  });
  
  currentChild.stderr.on('data', (data) => {
    console.log(`Received stderr data: ${data.length} bytes`);
    console.log(`Error data: ${data.toString().substring(0, 200)}...`);
    errorData.push(data);
  });
  
  currentChild.on('close', (code) => {
    clearTimeout(timeout);
    console.log(`Child process exited with code ${code}`);
    
    if (code === 0 && pdfData.length > 0) {
      const pdfBuffer = Buffer.concat(pdfData);
      console.log(`Sending PDF: ${pdfBuffer.length} bytes`);
      
      // Cache the result
      try {
        fs.writeFileSync(cacheFile, pdfBuffer);
        console.log(`Cached PDF with hash: ${contentHash}`);
      } catch (cacheError) {
        console.error('Failed to cache PDF:', cacheError);
      }
      
      res.set('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } else {
      console.log('Compilation failed or no PDF generated');
      console.log('Error output:', Buffer.concat(errorData).toString());
      res.status(500).json({ 
        error: 'Compilation failed', 
        stderr: Buffer.concat(errorData).toString() 
      });
    }
    
    currentChild = null;
    isCompiling = false;
    processNextInQueue();
  });
  
  currentChild.on('error', (error) => {
    clearTimeout(timeout);
    console.error('Child process error:', error);
    res.status(500).json({ error: 'Process error', details: error.message });
    currentChild = null;
    isCompiling = false;
    processNextInQueue();
  });
});

function processNextInQueue() {
  if (queue.length > 0) {
    console.log(`Processing next request from queue (${queue.length} remaining)`);
    const { req, res } = queue.shift();
    // Re-trigger the compile endpoint
    app._router.handle(req, res);
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    queueLength: queue.length, 
    isCompiling,
    cacheSize: cache.size,
    uptime: process.uptime()
  });
});

app.get('/stats', (req, res) => {
  const cacheFiles = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.pdf'));
  res.json({
    cacheFiles: cacheFiles.length,
    cacheSize: cacheFiles.length,
    queueLength: queue.length,
    isCompiling,
    uptime: process.uptime()
  });
});

app.post('/clear-cache', (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    files.forEach(file => {
      if (file.endsWith('.pdf')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    });
    res.json({ success: true, cleared: files.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  if (currentChild) {
    currentChild.kill('SIGKILL');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  if (currentChild) {
    currentChild.kill('SIGKILL');
  }
  process.exit(0);
});

app.listen(port, () => {
  console.log(`LaTeX service running on port ${port}`);
  console.log(`Cache directory: ${CACHE_DIR}`);
}); 