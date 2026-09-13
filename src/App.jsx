import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import "./App.css";
import AppLayout from "./layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "@/hooks/use-theme";
import ProtectedRoute from "./components/protected-route";

// Pages are lazy-loaded to keep the initial bundle small
const LandingPage = lazy(() => import("./Pages/LandingPage"));
const Onboarding = lazy(() => import("./Pages/Onboarding"));
const JobListings = lazy(() => import("./Pages/JobListings"));
const Job = lazy(() => import("./Pages/Job"));
const PostJob = lazy(() => import("./Pages/PostJob"));
const SavedJobs = lazy(() => import("./Pages/SavedJobs"));
const MyJobs = lazy(() => import("./Pages/MyJobs"));

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <BarLoader width={"100%"} color="#36d7b7" />
  </div>
);

/**
 * Aligns Clerk's auth modals with the active app theme.
 * Rendered inside ThemeProvider so it can read the resolved theme.
 */
const ThemedClerkProvider = ({ children }) => {
  const { resolvedTheme } = useTheme();

  const appearance = resolvedTheme === "dark" ? { theme: dark } : undefined;

  return (
    <ClerkProvider appearance={appearance} publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
};

const App = () => {
  const router = createBrowserRouter([
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: (
            <Suspense fallback={<LazyFallback />}>
              <LandingPage />
            </Suspense>
          ),
        },
        {
          path: "/onboarding",
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <Onboarding />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/jobs",
          element: (
            <ProtectedRoute allow="candidate">
              <Suspense fallback={<LazyFallback />}>
                <JobListings />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/job/:id",
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <Job />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/post-job",
          element: (
            <ProtectedRoute allow="recruiter">
              <Suspense fallback={<LazyFallback />}>
                <PostJob />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/saved-jobs",
          element: (
            <ProtectedRoute allow="candidate">
              <Suspense fallback={<LazyFallback />}>
                <SavedJobs />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: "/my-jobs",
          element: (
            <ProtectedRoute>
              <Suspense fallback={<LazyFallback />}>
                <MyJobs />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ThemedClerkProvider>
        <RouterProvider router={router} />
      </ThemedClerkProvider>
    </ThemeProvider>
  );
};

export default App;
