import { lazy, Suspense } from "react";

const MarkdownPreview = lazy(() => import("@uiw/react-markdown-preview"));

/**
 * Read-only markdown renderer for job requirements. Lazily loaded to keep
 * the editor bundle out of the initial page load.
 */
const JobMarkdown = ({ source, className }) => {
  if (!source) return null;

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <MarkdownPreview
        source={source}
        className={className}
        breaks
        style={{ color: "var(--foreground)", background: "transparent" }}
        warpperElement={{ "data-color-mode": "auto" }}
      />
    </Suspense>
  );
};

export default JobMarkdown;
