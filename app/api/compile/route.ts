import { NextResponse } from 'next/server';
import katex from 'katex';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    // KaTeX macro definitions for custom commands
    const macros = {
      '\\Ric': '\\mathrm{Ric}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
      '\\Z': '\\mathbb{Z}',
      '\\N': '\\mathbb{N}',
      '\\Q': '\\mathbb{Q}',
      '\\Tau': '\\mathcal{T}',
      '\\Hom': '\\mathrm{Hom}',
      '\\Tr': '\\mathrm{Tr}',
      '\\pr': '\\mathrm{pr}',
      '\\Div': '\\mathrm{div}',
      '\\curl': '\\mathrm{curl}',
      '\\E': '\\mathbb{E}',
      '\\Var': '\\mathrm{Var}',
      '\\Cov': '\\mathrm{Cov}',
      '\\tensor': '\\text{#1}\\,{\\vphantom{#1}}^{#2}_{#3}',
      '\\tensor[1]': '\\text{#1}',
      '\\tensor[2]': '\\text{#1}\\,{\\vphantom{#1}}^{#2}',
      '\\tensor[3]': '\\text{#1}\\,{\\vphantom{#1}}^{#2}_{#3}',
      '\\tensor{R}': 'R^{#1}_{#2}',
      '\\tensor{S}': 'S^{#1}_{#2}',
      '\\indices': '{\\vphantom{X}}^{#1}_{#2}'
    };

    // Extract content between \begin{document} and \end{document}
    const documentMatch = content.match(/\\begin{document}([\s\S]*?)\\end{document}/);
    if (!documentMatch) {
      throw new Error('No document environment found');
    }

    // Extract metadata
    const title = content.match(/\\title{(.*?)}/)?.[ 1 ] || '';
    const author = content.match(/\\author{(.*?)}/)?.[ 1 ] || '';
    const date = content.match(/\\date{(.*?)}/)?.[ 1 ] || '';

    // Process document content
    let documentContent = documentMatch[1]
      // Handle document structure
      .replace(/\\maketitle/, `
        <div class="title-block">
          <h1>${title}</h1>
          ${author ? `<p class="author">${author}</p>` : ''}
          ${date ? `<p class="date">${date}</p>` : ''}
        </div>
      `)
      .replace(/\\section{(.*?)}/g, '<h2>$1</h2>')
      .replace(/\\subsection{(.*?)}/g, '<h3>$1</h3>')
      .replace(/\\begin{abstract}([\s\S]*?)\\end{abstract}/g, '<div class="abstract">$1</div>')
      .replace(/\\begin{theorem}([\s\S]*?)\\end{theorem}/g, '<div class="theorem"><strong>Theorem.</strong>$1</div>')
      .replace(/\\begin{lemma}([\s\S]*?)\\end{lemma}/g, '<div class="theorem"><strong>Lemma.</strong>$1</div>')
      .replace(/\\begin{equation}([\s\S]*?)\\end{equation}/g, (_: string, math: string) => 
        `<div class="equation">${katex.renderToString(math.trim(), { displayMode: true, macros })}</div>`
      )
      .replace(/\\begin{align}([\s\S]*?)\\end{align}/g, (_: string, math: string) => {
        // Convert align to array environment
        const alignedMath = math
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\\\\');
        return `<div class="equation">${
          katex.renderToString(`\\begin{array}{rcl}${alignedMath}\\end{array}`, {
            displayMode: true,
            macros
          })
        }</div>`;
      })
      // Handle inline math
      .replace(/\$\$(.*?)\$\$/g, (_: string, math: string) => katex.renderToString(math.trim(), { displayMode: true, macros }))
      .replace(/\$(.*?)\$/g, (_: string, math: string) => katex.renderToString(math.trim(), { macros }));

    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
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
            .author, .date { 
              color: #666;
              margin: 0.5rem 0;
            }
            h1 { color: #1a365d; }
            h2 { 
              color: #2563eb;
              margin-top: 2rem;
            }
            .abstract {
              font-style: italic;
              margin: 2rem 0;
              padding: 1rem;
              background: #f8fafc;
              border-left: 4px solid #2563eb;
            }
            .theorem {
              margin: 1rem 0;
              padding: 1rem;
              background: #f8fafc;
              border-left: 4px solid #2563eb;
            }
            .equation {
              overflow-x: auto;
              margin: 1rem 0;
              text-align: center;
            }
          </style>
        </head>
        <body>${documentContent}</body>
      </html>
    `;

    return NextResponse.json({ html: styledHtml });

  } catch (error) {
    console.error('Compilation error:', error);
    return NextResponse.json({ error: 'Failed to compile LaTeX' }, { status: 500 });
  }
} 