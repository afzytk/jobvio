import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { BarLoader } from "react-spinners";

/**
 * Route guard.
 * - Requires sign-in (redirects to home with sign-in modal trigger).
 * - Requires an onboarding role (redirects to /onboarding).
 * - Optionally restricts a route to one role via `allow`, e.g. allow="candidate".
 */
const ProtectedRoute = ({ children, allow }) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { pathname } = useLocation();

  if (!isLoaded) {
    return <BarLoader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/?sign-in=true" replace />;
  }

  if (!user.unsafeMetadata?.role && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect mismatched roles to their own home base
  if (allow && user.unsafeMetadata?.role !== allow) {
    return <Navigate to={user.unsafeMetadata.role === "recruiter" ? "/my-jobs" : "/jobs"} replace />;
  }

  return children;
};

export default ProtectedRoute;
