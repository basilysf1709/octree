import { NextResponse } from 'next/server';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import container from 'markdown-it-container';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    // Extract document content
    const documentMatch = content.match(/\\begin{document}([\s\S]*?)\\end{document}/);
    if (!documentMatch) {
      throw new Error('No document environment found');
    }

    // Extract metadata
    const title = content.match(/\\title{(.*?)}/)?.[ 1 ] || 'Untitled';
    const author = content.match(/\\author{(.*?)}/)?.[ 1 ] || '';
    const date = content.match(/\\date{(.*?)}/)?.[ 1 ] || '';

    // Process LaTeX to HTML
    const md = new MarkdownIt()
      .use(texmath, {
        engine: require('katex'),
        delimiters: 'dollars',
        macros: {"\\RR": "\\mathbb{R}"}
      })
      .use(container, 'theorem')
      .use(container, 'proof');

    // Convert LaTeX commands to HTML/Markdown
    let processedContent = documentMatch[1]
      .replace(/\\section{(.*?)}/g, '# $1\n\n')
      .replace(/\\subsection{(.*?)}/g, '## $1\n\n')
      .replace(/\\textbf{(.*?)}/g, '**$1**')
      .replace(/\\textit{(.*?)}/g, '*$1*')
      .replace(/\\emph{(.*?)}/g, '*$1*')
      .replace(/\\begin{itemize}([\s\S]*?)\\end{itemize}/g, (_: any, list: string) => 
        list.split('\\item').filter(Boolean).map((item: string) => `- ${item.trim()}`).join('\n')
      )
      .replace(/\\begin{enumerate}([\s\S]*?)\\end{enumerate}/g, (_: any, list: string) => 
        list.split('\\item').filter(Boolean).map((item: string, i: number) => `${i + 1}. ${item.trim()}`).join('\n')
      );

    const renderedContent = md.render(processedContent);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
          <style>
            body { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 2rem; 
              font-family: system-ui;
              line-height: 1.6;
            }
            .title-block {
              text-align: center;
              margin-bottom: 3rem;
            }
            h1 { 
              color: #1a365d;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 0.5rem;
            }
            h2 { color: #2563eb; }
            h3 { color: #3b82f6; }
            .theorem {
              background: #f8fafc;
              border-left: 4px solid #2563eb;
              padding: 1rem;
              margin: 1rem 0;
            }
            .proof {
              background: #f1f5f9;
              padding: 1rem;
              margin: 1rem 0;
            }
            .katex { font-size: 1.1em; }
            .katex-display { 
              overflow-x: auto;
              padding: 1rem 0;
            }
            ul, ol {
              padding-left: 1.5rem;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 0.5rem;
            }
            code {
              background: #f1f5f9;
              padding: 0.2rem 0.4rem;
              border-radius: 0.25rem;
            }
          </style>
        </head>
        <body>
          <div class="title-block">
            <h1>${title}</h1>
            ${author && `<p class="author">${author}</p>`}
            ${date && `<p class="date">${date}</p>`}
          </div>
          ${renderedContent}
        </body>
      </html>
    `;

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process LaTeX' }, { status: 500 });
  }
} 