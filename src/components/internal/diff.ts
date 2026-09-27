/** Line diff via LCS. Small inputs only, which is all a step payload or a prompt ever is. */

export type DiffLine = { kind: 'same' | 'add' | 'remove'; text: string };

export function diffLines(before: string[], after: string[]): DiffLine[] {
  const n = before.length;
  const m = after.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i][j] = before[i] === after[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      out.push({ kind: 'same', text: before[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ kind: 'remove', text: before[i] });
      i += 1;
    } else {
      out.push({ kind: 'add', text: after[j] });
      j += 1;
    }
  }
  while (i < n) out.push({ kind: 'remove', text: before[i++] });
  while (j < m) out.push({ kind: 'add', text: after[j++] });
  return out;
}

export function diffStats(lines: DiffLine[]) {
  return {
    added: lines.filter((line) => line.kind === 'add').length,
    removed: lines.filter((line) => line.kind === 'remove').length,
  };
}
