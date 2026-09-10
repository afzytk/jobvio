import { Link, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import { Briefcase, BriefcaseBusiness, Heart, PenBox } from "lucide-react";
import { useEffect } from "react";

const Header = () => {
  const [search] = useSearchParams();
  const { user } = useUser();
  const clerk = useClerk();

  const role = user?.unsafeMetadata?.role;

  useEffect(() => {
    if (search.get("sign-in")) {
      clerk.openSignIn();
    }
  }, [search, clerk]);

  return (
    <nav className="py-4 flex justify-between items-center">
      <Link to="/">
        <img src="/logo.png" alt="jobvio logo" className="h-36" />
      </Link>

      <div className="flex gap-8 items-center">
        <SignedOut>
          <div className="flex gap-4">
            <SignInButton mode="modal" fallbackRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>

            <SignUpButton mode="modal" fallbackRedirectUrl="/onboarding">
              <Button variant="blue">Sign Up</Button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          {user?.unsafeMetadata?.role === "recruiter" && (
            <Link to="/post-job">
              <Button variant="destructive" className="rounded-full">
                <PenBox size={20} className="mr-2" />
                Post a Job
              </Button>
            </Link>
          )}

          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: "3rem",
                  height: "3rem",
                },
              },
            }}
          >
            <UserButton.UserProfilePage
              label="Account Role"
              url="account-role"
              labelIcon={<Briefcase size={15} />}
            >
              <div className="p-6">
                <h1 className="text-xl font-bold mb-4">Account Role</h1>
                <div className="text-lg">
                  Current Role:{" "}
                  <span className="font-bold capitalize text-red-600">
                    {role || "Not selected"}
                  </span>
                </div>
              </div>
            </UserButton.UserProfilePage>

            <UserButton.MenuItems>
              <UserButton.Link
                label="My Jobs"
                labelIcon={<BriefcaseBusiness size={15} />}
                href="/my-jobs"
              />
              <UserButton.Link
                label="Saved Jobs"
                labelIcon={<Heart size={15} />}
                href="/saved-jobs"
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Header;
