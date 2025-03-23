import { languages } from 'monaco-editor/esm/vs/editor/editor.api';

export const latexLanguageConfiguration: languages.LanguageConfiguration = {
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '`', close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '`', close: "'" },
  ],
};

export const latexTokenProvider: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenizer: {
    root: [
      [/\\[a-zA-Z]+/, 'keyword'],
      [/\$\$/, 'delimiter.math'],
      [/\$/, 'delimiter.math'],
      [/%.*$/, 'comment'],
      [/[{}()\[\]]/, 'delimiter'],
      [/\\[^a-zA-Z]/, 'keyword'],
    ],
  },
}; 