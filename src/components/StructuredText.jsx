import { useMemo } from "react";

const BULLET_RE = /^\s*(?:[-•*]|\u2022)\s+/;
const ORDERED_RE = /^\s*\d+[.)]\s+/;
const HEADING_RE = /^\s*#{1,6}\s+/;

/**
 * Decode HTML entities (&amp;, &#39;, …) using the browser's native parser.
 * Safe: the text is assigned as a textarea value, never injected as markup.
 */
const decodeEntities = (text) => {
  if (!text || !text.includes("&")) return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Parse text into structured blocks:
 *  - "heading":  markdown-style "# Heading" lines
 *  - "ul":       consecutive "- ", "* " or "• " lines
 *  - "ol":       consecutive "1." / "2)" lines
 *  - "p":        consecutive plain lines joined into one paragraph
 *
 * When `isHtml` is true (external JSearch jobs), tags are first converted to
 * line breaks/bullets, then stripped, then entities are decoded.
 */
const toBlocks = (source, isHtml) => {
  let text = source ?? "";
  if (!text.trim()) return [];

  if (isHtml) {
    text = text
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(?:p|li|h[1-6]|div|tr|ul|ol)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]*>/g, "");
    text = decodeEntities(text);
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const blocks = [];
  let current = null;

  const flush = () => {
    if (current) blocks.push(current);
    current = null;
  };

  for (const line of lines) {
    if (!line) {
      flush();
      continue;
    }
    if (HEADING_RE.test(line)) {
      flush();
      blocks.push({ type: "heading", text: line.replace(HEADING_RE, "") });
      continue;
    }
    if (BULLET_RE.test(line)) {
      if (!current || current.type !== "ul") {
        flush();
        current = { type: "ul", items: [] };
      }
      current.items.push(line.replace(BULLET_RE, ""));
      continue;
    }
    if (ORDERED_RE.test(line)) {
      if (!current || current.type !== "ol") {
        flush();
        current = { type: "ol", items: [] };
      }
      current.items.push(line.replace(ORDERED_RE, ""));
      continue;
    }
    if (current && current.type === "p") {
      current.text += ` ${line}`;
    } else {
      flush();
      current = { type: "p", text: line };
    }
  }
  flush();
  return blocks;
};

const renderBlock = (block, index) => {
  switch (block.type) {
    case "heading":
      return (
        <h3
          key={index}
          className="text-lg font-semibold mt-4 first:mt-0 text-foreground"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={index} className="list-disc pl-6 space-y-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index} className="list-decimal pl-6 space-y-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    default:
      return <p key={index}>{block.text}</p>;
  }
};

/**
 * Renders free-form job text (plain text or HTML) in a structured,
 * readable way: paragraphs, headings and bullet/numbered lists.
 */
const StructuredText = ({ text, asHtml = false, className = "" }) => {
  const blocks = useMemo(() => toBlocks(text, asHtml), [text, asHtml]);

  if (!blocks.length) return null;

  return (
    <div className={`space-y-3 leading-relaxed sm:text-lg ${className}`}>
      {blocks.map(renderBlock)}
    </div>
  );
};

export default StructuredText;
