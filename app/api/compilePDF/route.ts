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

    console.log('Received content:', content);

    // Check environment
    const isProd = process.env.ENVIRONMENT === 'prod';

    if (isProd) {
      // Use the remote TeX Live service in production
      try {
        console.log('Starting remote PDF generation...');

        const response = await fetch('http://142.93.195.236:3001/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: content,
        });

        console.log('Remote server response status:', response.status);
        console.log(
          'Remote server response headers:',
          JSON.stringify(Object.fromEntries([...response.headers]))
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Remote server error response:', errorText);
          throw new Error(`LaTeX compilation failed: ${errorText}`);
        }

        const pdfArrayBuffer = await response.arrayBuffer();
        console.log('PDF buffer received, size:', pdfArrayBuffer.byteLength);

        // Check the first few bytes
        const firstBytes = Buffer.from(pdfArrayBuffer.slice(0, 20)).toString(
          'hex'
        );
        console.log('PDF starts with (hex):', firstBytes);

        // Convert to Base64
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        const base64PDF = pdfBuffer.toString('base64');
        console.log('Base64 PDF length:', base64PDF.length);
        console.log('Base64 PDF starts with:', base64PDF.substring(0, 40));

        // Return with verbose info
        return NextResponse.json({
          pdf: base64PDF,
          size: pdfBuffer.length,
          mimeType: 'application/pdf',
          debugInfo: {
            firstBytesHex: firstBytes,
            contentLength: pdfArrayBuffer.byteLength,
            base64Length: base64PDF.length,
          },
        });
      } catch (error) {
        console.error('Remote compilation error:', error);
        return NextResponse.json(
          {
            error: 'LaTeX compilation failed on remote server',
            details: String(error),
          },
          { status: 500 }
        );
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
        console.log(
          `Running Docker command: docker run --rm -v ${tempDir}:/data texlive/texlive pdflatex -interaction=nonstopmode -output-directory=/data /data/main.tex`
        );

        // Run pdflatex in Docker - continue even with LaTeX errors
        const { stdout, stderr } = await execAsync(
          `docker run --rm -v ${tempDir}:/data texlive/texlive pdflatex -interaction=nonstopmode -output-directory=/data /data/main.tex`
        );

        console.log('Docker stdout:', stdout);
        if (stderr) console.error('Docker stderr:', stderr);

        // Check if PDF was created regardless of errors
        const pdfPath = path.join(tempDir, 'main.pdf');

        if (fs.existsSync(pdfPath)) {
          // Read the PDF file
          const pdfBuffer = fs.readFileSync(pdfPath);

          // After getting the PDF buffer
          console.log('PDF buffer size:', pdfBuffer.byteLength);
          console.log(
            'PDF starts with:',
            pdfBuffer.slice(0, 10).toString('hex')
          );

          // Log any LaTeX warnings/errors for debugging
          const logPath = path.join(tempDir, 'main.log');
          if (fs.existsSync(logPath)) {
            const logContent = fs.readFileSync(logPath, 'utf-8');
            console.log('LaTeX compilation log (warnings/errors):', logContent);
          }

          // Clean up temporary files
          fs.rmSync(tempDir, { recursive: true, force: true });

          // Convert to Base64 to match production behavior
          const base64PDF = pdfBuffer.toString('base64');

          // Return Base64 data in JSON
          return NextResponse.json({
            pdf: base64PDF,
            size: pdfBuffer.length,
          });
        } else {
          console.error('PDF not found at path:', pdfPath);
          throw new Error('PDF file not created');
        }
      } catch (error) {
        console.error('Docker execution error:', error);

        // If compilation fails, try to get the log file for debugging
        const logPath = path.join(tempDir, 'main.log');
        let logContent = '';

        if (fs.existsSync(logPath)) {
          logContent = fs.readFileSync(logPath, 'utf-8');
          console.log('LaTeX compilation log:', logContent);
        } else {
          console.error('No LaTeX log file found');
        }

        // Check if PDF was created despite errors
        const pdfPath = path.join(tempDir, 'main.pdf');
        if (fs.existsSync(pdfPath)) {
          console.log('PDF was generated despite errors - returning it anyway');
          const pdfBuffer = fs.readFileSync(pdfPath);

          // After getting the PDF buffer
          console.log('PDF buffer size:', pdfBuffer.byteLength);
          console.log(
            'PDF starts with:',
            pdfBuffer.slice(0, 10).toString('hex')
          );

          // Clean up
          fs.rmSync(tempDir, { recursive: true, force: true });

          // Convert to Base64 to match production behavior
          const base64PDF = pdfBuffer.toString('base64');

          // Return Base64 data in JSON
          return NextResponse.json({
            pdf: base64PDF,
            size: pdfBuffer.length,
          });
        }

        // No PDF was generated, return error
        return NextResponse.json(
          {
            error: 'LaTeX compilation failed',
            details: String(error),
            log: logContent,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json(
      { error: 'Failed to compile LaTeX' },
      { status: 500 }
    );
  }
}
