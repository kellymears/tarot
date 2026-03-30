/**
 * Word-wrap text to a given width, ensuring no line starts with a space.
 * Ink's built-in `wrap="wrap"` can leave leading spaces on continuation
 * lines — this function avoids that by breaking at word boundaries cleanly.
 */
export function wordWrap(text: string, width: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line.length === 0) {
      line = word;
    } else if (line.length + 1 + word.length <= width) {
      line += " " + word;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) lines.push(line);

  return lines.join("\n");
}
