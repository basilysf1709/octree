import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function LatexRenderer({ latex }: { latex: string }) {
  return (
    <div style={{ maxWidth: '400px', overflow: 'auto' }}>
      <SyntaxHighlighter
        language="latex"
        style={oneDark}
        showLineNumbers
        wrapLines
        customStyle={{
          maxWidth: '400px',
          fontSize: '10px',
          margin: 0,
        }}
      >
        {latex}
      </SyntaxHighlighter>
    </div>
  );
}
