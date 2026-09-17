import React from "react";

/**
 * Renders merchant copy with `**bold**` runs highlighted.
 *
 * Several sections used to hard-code a `<span className="font-bold">` around a
 * domain or a figure inside a sentence. Now that those sentences are editable,
 * the emphasis has to survive being typed into a text box — without letting
 * merchant copy become markup.
 *
 * Everything is emitted as text nodes. `**` is the only syntax, chosen because
 * it's the one people already type; anything else is shown literally.
 */
export const InlineText: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  if (!text) return null;

  const parts = text.split(/\*\*(.+?)\*\*/g);

  return (
    <>
      {parts.map((part, index) =>
        // Odd indices are the captured groups — the text between the markers.
        index % 2 === 1 ? (
          <span key={index} className={className ?? "font-bold text-foreground"}>
            {part}
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
};
