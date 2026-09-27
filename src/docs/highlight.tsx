import * as React from 'react';

/**
 * A tiny TSX tokenizer that emits base-ui's syntax classes (pl-k, pl-s, pl-c1, pl-c,
 * pl-ent). Not a full parser — enough to make our snippets look like theirs.
 */

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'new',
  'class',
  'interface',
  'type',
  'extends',
  'implements',
  'as',
  'async',
  'await',
  'yield',
  'try',
  'catch',
  'finally',
  'throw',
  'typeof',
  'instanceof',
  'in',
  'of',
  'void',
  'this',
  'super',
  'static',
  'public',
  'private',
  'readonly',
  'enum',
  'declare',
  'satisfies',
  'keyof',
]);

const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN']);

type Token = { text: string; cls?: string };

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let index = 0;

  // comments | strings | numbers | identifiers | punctuation-run
  const pattern =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)|([^\s\w]+|\s+)/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code))) {
    const [text, comment, string, number, ident, other] = match;

    if (comment) {
      tokens.push({ text, cls: 'pl-c' });
    } else if (string) {
      tokens.push({ text, cls: 'pl-s' });
    } else if (number) {
      tokens.push({ text, cls: 'pl-c1' });
    } else if (ident) {
      const before = code.slice(0, match.index);
      const isJsxTag = /<\/?[A-Za-z_$][\w$.[:]*$/.test(before);
      const isAttr = /[A-Za-z_$][\w$]*\s*$/.test(before.replace(/^[\s\S]*[<>]/, '')) === false && /<[A-Za-z]/.test(before.split('<').pop() ?? '');
      if (KEYWORDS.has(text)) tokens.push({ text, cls: 'pl-k' });
      else if (LITERALS.has(text)) tokens.push({ text, cls: 'pl-c1' });
      else if (isJsxTag) tokens.push({ text, cls: 'pl-ent' });
      else if (isAttr) tokens.push({ text, cls: 'pl-e' });
      else tokens.push({ text });
    } else if (other) {
      tokens.push({ text: other });
    }

    last = match.index + text.length;
    index += 1;
  }

  if (last < code.length) tokens.push({ text: code.slice(last) });
  return tokens;
}

export function highlight(code: string): React.ReactNode {
  const tokens = tokenize(code);
  return tokens.map((token, i) =>
    token.cls ? (
      <span key={i} className={token.cls}>
        {token.text}
      </span>
    ) : (
      <React.Fragment key={i}>{token.text}</React.Fragment>
    ),
  );
}
