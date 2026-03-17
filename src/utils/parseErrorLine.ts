/**
 * Heuristic extraction of the error line number from a Mermaid error message.
 * Returns 1-based line number, or null if unable to determine.
 */
export function parseErrorLine(errorMessage: string, code: string): number | null {
  // Match "line N" pattern
  const lineMatch = errorMessage.match(/line\s+(\d+)/i);
  if (lineMatch) {
    const line = parseInt(lineMatch[1], 10);
    if (line > 0) return line;
  }

  // Invalid header → line 1
  if (/invalid.*header/i.test(errorMessage) || /empty.*diagram/i.test(errorMessage)) {
    return 1;
  }

  // Try to find quoted content from the error in source lines
  const quotedMatches = errorMessage.match(/["'`]([^"'`]+)["'`]/g);
  if (quotedMatches) {
    const lines = code.split('\n');
    for (const quoted of quotedMatches) {
      const content = quoted.slice(1, -1);
      if (content.length < 2) continue;
      const idx = lines.findIndex(l => l.includes(content));
      if (idx !== -1) return idx + 1;
    }
  }

  // Try to match "at position" or "col" patterns to find the line
  const posMatch = errorMessage.match(/at\s+position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    let charCount = 0;
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1; // +1 for newline
      if (charCount > pos) return i + 1;
    }
  }

  return null;
}
