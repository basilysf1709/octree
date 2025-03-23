declare module 'latex.js' {
  export class Generator {
    constructor(options?: { customHeaders?: string[] });
    parse(content: string): { html: string };
  }
} 