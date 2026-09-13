import { lazy, Suspense } from "react";
import { BarLoader } from "react-spinners";

const MarkdownEditor = lazy(() => import("@uiw/react-markdown-editor"));

/**
 * Code-split wrapper around the CodeMirror markdown editor (~1 MB). Loads on
 * demand so it stays out of the initial bundle; only the Post Job page needs it.
 */
const LazyMarkdownEditor = (props) => (
  <Suspense fallback={<BarLoader className="my-4" width={"100%"} color="#36d7b7" />}>
    <MarkdownEditor {...props} />
  </Suspense>
);

export default LazyMarkdownEditor;
