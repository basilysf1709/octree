import { NextResponse } from 'next/server';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
}

// This would typically fetch from RSS feeds or other sources
// For now, we'll simulate recent LaTeX news items
async function fetchLatexNews(): Promise<NewsItem[]> {
  // In a real app, you would fetch from external sources
  return [
    {
      id: '1',
      title: 'LaTeX3 Major Update Released',
      summary: 'The LaTeX Project team announced a significant update to LaTeX3, introducing new programming interfaces and improved document processing capabilities.',
      date: '2023-11-15',
      source: 'LaTeX Project',
      url: 'https://www.latex-project.org/',
      imageUrl: 'https://www.latex-project.org/img/latex-project-logo.svg'
    },
    {
      id: '2',
      title: 'TikZ 4.0 Released with New Features',
      summary: 'The popular LaTeX graphics package TikZ released version 4.0 with enhanced diagram creation tools and performance improvements.',
      date: '2023-10-21',
      source: 'CTAN',
      url: 'https://ctan.org/pkg/pgf',
    },
    {
      id: '3',
      title: 'New BibLaTeX Version Improves Citation Management',
      summary: 'BibLaTeX 3.19 released with improved handling of complex citations and better integration with reference management software.',
      date: '2023-09-12',
      source: 'CTAN',
      url: 'https://ctan.org/pkg/biblatex',
    },
    {
      id: '4',
      title: 'Overleaf Introduces AI-Powered LaTeX Suggestions',
      summary: 'Online LaTeX editor Overleaf has launched a new feature that provides AI-powered code suggestions and auto-completion for LaTeX documents.',
      date: '2023-08-05',
      source: 'Overleaf Blog',
      url: 'https://www.overleaf.com/blog',
      imageUrl: 'https://cdn.overleaf.com/img/ol-brand/overleaf_og_logo.png'
    },
    {
      id: '5',
      title: 'TeX Live 2023 Now Available',
      summary: 'The annual release of TeX Live is now available with hundreds of updated packages and improved support for modern operating systems.',
      date: '2023-07-19',
      source: 'TeX Users Group',
      url: 'https://tug.org/texlive/',
    },
    {
      id: '6',
      title: 'New Mathematical Fonts for LaTeX Documents',
      summary: 'STIX Two Math and other new font families are now available for mathematical typesetting in LaTeX, offering improved readability and symbol coverage.',
      date: '2023-06-30',
      source: 'CTAN',
      url: 'https://ctan.org/pkg/stix2-otf',
    }
  ];
}

export async function GET() {
  try {
    const news = await fetchLatexNews();
    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error fetching LaTeX news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LaTeX news' },
      { status: 500 }
    );
  }
} 