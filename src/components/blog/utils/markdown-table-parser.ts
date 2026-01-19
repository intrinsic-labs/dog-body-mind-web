/**
 * Parses a markdown table string into structured data
 */
export interface TableData {
  headers: string[];
  rows: string[][];
}

export function parseMarkdownTable(markdown: string): TableData | null {
  if (!markdown || !markdown.trim()) return null;

  const lines = markdown
    .trim()
    .split(/\r?\n/) // Handle both \n and \r\n line endings
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return null;

  // Parse all lines, filtering out the separator line
  const parsedLines = lines
    .filter((line, index) => {
      // Skip separator line (the one with dashes like |---|---|)
      if (index === 1 && /^[\s|:\-]+$/.test(line)) return false;
      return true;
    })
    .map((line) => {
      // Split by | and clean up
      const parts = line.split('|').map((cell) => cell.trim());
      // Remove first and last if they're empty (from leading/trailing pipes)
      if (parts[0] === '') parts.shift();
      if (parts[parts.length - 1] === '') parts.pop();
      return parts;
    })
    .filter((row) => row.length > 0);

  if (parsedLines.length === 0) return null;

  // First line is headers, rest are rows
  const [headers, ...rows] = parsedLines;

  return {
    headers,
    rows,
  };
}
