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

    // Check environment
    const isProd = process.env.ENVIRONMENT === 'prod';

    if (isProd) {
      // Use the remote TeX Live service in production
      try {

        const response = await fetch('http://142.93.195.236:3001/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: content,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Remote server error response:', errorText);
          throw new Error(`LaTeX compilation failed: ${errorText}`);
        }

        const pdfArrayBuffer = await response.arrayBuffer();

        // Check the first few bytes
        const firstBytes = Buffer.from(pdfArrayBuffer.slice(0, 20)).toString(
          'hex'
        );

        // Convert to Base64
        const pdfBuffer = Buffer.from(pdfArrayBuffer);
        const base64PDF = pdfBuffer.toString('base64');


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
        // Run pdflatex in Docker - continue even with LaTeX errors
        const { stdout, stderr } = await execAsync(
          `docker run --rm -v ${tempDir}:/data texlive/texlive pdflatex -interaction=nonstopmode -output-directory=/data /data/main.tex`
        );

        if (stderr) console.error('Docker stderr:', stderr);

        // Check if PDF was created regardless of errors
        const pdfPath = path.join(tempDir, 'main.pdf');

        if (fs.existsSync(pdfPath)) {
          // Read the PDF file
          const pdfBuffer = fs.readFileSync(pdfPath);

          // Log any LaTeX warnings/errors for debugging
          const logPath = path.join(tempDir, 'main.log');
          if (fs.existsSync(logPath)) {
            fs.readFileSync(logPath, 'utf-8');
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
        } else {
          console.error('No LaTeX log file found');
        }

        // Check if PDF was created despite errors
        const pdfPath = path.join(tempDir, 'main.pdf');
        if (fs.existsSync(pdfPath)) {
          const pdfBuffer = fs.readFileSync(pdfPath);

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
