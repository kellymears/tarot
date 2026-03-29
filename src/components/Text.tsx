import type { ComponentProps } from "react";

import { Text as InkText } from "ink";

import { wordWrap } from "../wrap.js";

interface TextProps extends ComponentProps<typeof InkText> {
  textWidth?: number;
}

export function Text({ children, textWidth, ...props }: TextProps) {
  const content =
    textWidth != null && typeof children === "string"
      ? wordWrap(children, textWidth)
      : children;

  return <InkText {...props}>{content}</InkText>;
}
