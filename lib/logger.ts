import fs from 'fs';
import path from 'path';

interface LogData {
  message?: string;
  [key: string]: unknown;
}

export function logToFile(message: string, data?: LogData) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message} ${data ? JSON.stringify(data) : ''}\n`;

  fs.appendFileSync(path.join(process.cwd(), 'auth.log'), logMessage);
}
