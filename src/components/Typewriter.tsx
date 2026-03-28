import type { ReactNode } from "react";

import { Transform } from "ink";

interface TypewriterProps {
  chars: number;
  children: ReactNode;
}

export function Typewriter({ chars, children }: TypewriterProps) {
  if (!isFinite(chars)) return <>{children}</>;

  return (
    <Transform transform={(content) => truncateVisible(content, chars)}>
      {children}
    </Transform>
  );
}

const truncateVisible = (str: string, maxChars: number): string => {
  let i = 0,
    visible = 0;

  while (i < str.length && visible < maxChars) {
    if (str[i] === "\x1b") {
      const end = str.indexOf("m", i);
      if (end !== -1) {
        i = end + 1;
        continue;
      }
    }
    visible++;
    i++;
  }

  return str.slice(0, i);
};
