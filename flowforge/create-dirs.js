const fs = require('fs');
const path = require('path');

const basePath = 'D:\\universalApiPlayground\\Universal-API-Playground\\flowforge\\frontend\\app';
const toolDir = path.join(basePath, 'tool');
const slugDir = path.join(toolDir, '[slug]');

// Create directories recursively
try {
  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
    console.log('Created tool directory');
  }
  
  if (!fs.existsSync(slugDir)) {
    fs.mkdirSync(slugDir, { recursive: true });
    console.log('Created [slug] directory');
  }
  
  console.log('Tool directory exists:', fs.existsSync(toolDir));
  console.log('[slug] directory exists:', fs.existsSync(slugDir));
} catch (err) {
  console.error('Error creating directories:', err.message);
}
