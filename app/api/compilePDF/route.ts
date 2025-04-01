/* eslint-disable */
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

// Set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    console.log("Received content:", content);
    
    // Check environment
    const isProd = process.env.ENVIRONMENT === 'prod';
    
    if (isProd) {
      // Use the remote TeX Live service in production
      try {
        // Make a request to your DigitalOcean service
        const response = await fetch('http://142.93.195.236:3001/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: content,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`LaTeX compilation failed: ${errorData.log || 'Unknown error'}`);
        }
        
        // Get the PDF directly from the response
        const pdfBuffer = await response.arrayBuffer();
        
        // After getting the PDF buffer
        console.log("PDF buffer size:", pdfBuffer.byteLength);
        console.log("PDF starts with:", Buffer.from(pdfBuffer).toString('hex'));
        
        // Check for PDF signature
        const isPdfValid = Buffer.from(pdfBuffer).toString() === '%PDF';
        console.log(`Appears to be valid PDF: ${isPdfValid}`);
        
        // Use correct return format for binary data
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"',
            'Content-Length': pdfBuffer.byteLength.toString()
          }
        });
      } catch (error) {
        console.error('Remote compilation error:', error);
        return NextResponse.json({ 
          error: 'LaTeX compilation failed on remote server', 
          details: String(error)
        }, { status: 500 });
      }
    } else {
      // Local development: Use Docker on the same machine
      // Create a unique ID for this compilation
      const compilationId = uuidv4();
      
      // Create temp directory in /tmp to work with Docker
      const tempDir = path.join('/tmp', compilationId);
      fs.mkdirSync(tempDir, { recursive: true });
      
      // Write the LaTeX content to a file
      const texFilePath = path.join(tempDir, 'main.tex');
      fs.writeFileSync(texFilePath, content);
      
      try {
        // Log the Docker command for debugging
        console.log(`Running Docker command: docker run --rm -v ${tempDir}:/data texlive/texlive pdflatex -interaction=nonstopmode -output-directory=/data /data/main.tex`);
        
        // Run pdflatex in Docker - continue even with LaTeX errors
        const { stdout, stderr } = await execAsync(`docker run --rm -v ${tempDir}:/data texlive/texlive pdflatex -interaction=nonstopmode -output-directory=/data /data/main.tex`);
        
        console.log("Docker stdout:", stdout);
        if (stderr) console.error("Docker stderr:", stderr);
        
        // Check if PDF was created regardless of errors
        const pdfPath = path.join(tempDir, 'main.pdf');
        
        if (fs.existsSync(pdfPath)) {
          // Read the PDF file
          const pdfBuffer = fs.readFileSync(pdfPath);
          
          // After getting the PDF buffer
          console.log("PDF buffer size:", pdfBuffer.byteLength);
          console.log("PDF starts with:", pdfBuffer.slice(0, 10).toString('hex'));
          
          // Log any LaTeX warnings/errors for debugging but still return the PDF
          const logPath = path.join(tempDir, 'main.log');
          if (fs.existsSync(logPath)) {
            const logContent = fs.readFileSync(logPath, 'utf-8');
            console.log("LaTeX compilation log (warnings/errors):", logContent);
          }
          
          // Clean up temporary files
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          // Return the PDF even if there were LaTeX errors
          console.log("PDF buffer size:", pdfBuffer.byteLength);
          console.log("PDF starts with:", pdfBuffer.toString('hex'));
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="document.pdf"',
              'Content-Length': pdfBuffer.byteLength.toString()
            }
          });
        } else {
          console.error("PDF not found at path:", pdfPath);
          throw new Error('PDF file not created');
        }
      } catch (error) {
        console.error('Docker execution error:', error);
        
        // If compilation fails, try to get the log file for debugging
        const logPath = path.join(tempDir, 'main.log');
        let logContent = '';
        
        if (fs.existsSync(logPath)) {
          logContent = fs.readFileSync(logPath, 'utf-8');
          console.log("LaTeX compilation log:", logContent);
        } else {
          console.error("No LaTeX log file found");
        }
        
        // Check if PDF was created despite errors
        const pdfPath = path.join(tempDir, 'main.pdf');
        if (fs.existsSync(pdfPath)) {
          console.log("PDF was generated despite errors - returning it anyway");
          const pdfBuffer = fs.readFileSync(pdfPath);
          
          // After getting the PDF buffer
          console.log("PDF buffer size:", pdfBuffer.byteLength);
          console.log("PDF starts with:", pdfBuffer.slice(0, 10).toString('hex'));
          
          // Clean up
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          // Return the PDF even though there were errors
          return new Response(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="document.pdf"',
              'Content-Length': pdfBuffer.byteLength.toString()
            }
          });
        }
        
        // No PDF was generated, return error
        return NextResponse.json({ 
          error: 'LaTeX compilation failed', 
          details: String(error),
          log: logContent 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json({ error: 'Failed to compile LaTeX' }, { status: 500 });
  }
} 