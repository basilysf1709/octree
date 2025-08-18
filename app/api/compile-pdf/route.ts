import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabase/server';

const execAsync = promisify(exec);

// Set runtime to nodejs
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    // Always use local Docker compilation (both dev and prod)
    console.log('Using local LaTeX compilation...');
    
    // Create a unique ID for this compilation
    const compilationId = uuidv4();

    // Create temp directory at project root to work with Docker
    const tempDir = path.join(process.cwd(), 'tmp', compilationId);
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

        // Convert to Base64
        const base64PDF = pdfBuffer.toString('base64');

        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        console.log('Local compilation successful:', {
          size: pdfBuffer.length,
          compilationId
        });

        return NextResponse.json({
          pdf: base64PDF,
          size: pdfBuffer.length,
          mimeType: 'application/pdf',
          debugInfo: {
            compilationId,
            method: 'local-docker',
            stdout: stdout.substring(0, 200),
            stderr: stderr ? stderr.substring(0, 200) : null
          },
        });
      } else {
        // PDF not created, check for log file
        const logPath = path.join(tempDir, 'main.log');
        let logContent = '';
        
        if (fs.existsSync(logPath)) {
          logContent = fs.readFileSync(logPath, 'utf-8');
        }

        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        throw new Error(`PDF not generated. Log: ${logContent.substring(0, 500)}`);
      }
    } catch (dockerError) {
      // Clean up temp directory
      fs.rmSync(tempDir, { recursive: true, force: true });

      console.error('Docker compilation error:', dockerError);
      throw new Error(`Docker compilation failed: ${dockerError}`);
    }
  } catch (error) {
    console.error('LaTeX compilation error:', error);
    return NextResponse.json(
      {
        error: 'LaTeX compilation failed',
        details: String(error),
        suggestion: 'Check your LaTeX syntax and try again'
      },
      { status: 500 }
    );
  }
}
