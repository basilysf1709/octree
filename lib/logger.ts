import fs from 'fs';
import path from 'path';

export function logToFile(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message} ${data ? JSON.stringify(data) : ''}\n`;
  
  fs.appendFileSync(path.join(process.cwd(), 'auth.log'), logMessage);
} 