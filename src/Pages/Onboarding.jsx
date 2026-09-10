import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State } from "country-state-city";

const Onboarding = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);

    // If recruiter, save immediately without location
    if (role === "recruiter") {
      await user
        .update({ unsafeMetadata: { role } })
        .then(() => {
          navigate("/post-job");
        })
        .catch((err) => {
          console.log("Error updating role:", err);
        });
    }
    // For candidates, wait for location selection
  };

  const handleCandidateComplete = async () => {
    if (!selectedLocation) {
      alert("Please select your preferred location");
      return;
    }

    await user
      .update({
        unsafeMetadata: {
          role: "candidate",
          location: selectedLocation
        }
      })
      .then(() => {
        navigate("/jobs");
      })
      .catch((err) => {
        console.log("Error updating profile:", err);
      });
  };

  useEffect(() => {
    if (user?.unsafeMetadata?.role) {
      navigate(
        user?.unsafeMetadata?.role === "recruiter" ? "/post-job" : "/jobs",
      );
    }
  });

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-32">
      <h2 className="gradient-title font-extrabold text-7xl sm:text-8xl tracking-tighter">
        I am a ...
      </h2>

      {!selectedRole && (
        <div className="mt-16 grid grid-cols-2 gap-4 w-full md:px-40">
          <Button
            variant="blue"
            className="h-36 text-2xl"
            onClick={() => handleRoleSelection("candidate")}
          >
            Candidate
          </Button>
          <Button
            variant="destructive"
            className="h-36 text-2xl"
            onClick={() => handleRoleSelection("recruiter")}
          >
            Recruiter
          </Button>
        </div>
      )}

      {selectedRole === "candidate" && (
        <div className="mt-16 w-full md:px-40">
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-center">
              Select Your Preferred Location
            </h3>
            <p className="text-gray-400 text-center mb-4">
              We'll show you jobs in your area first
            </p>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {State.getStatesOfCountry("IN").map(({ name }) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="blue"
              size="lg"
              className="mt-4"
              onClick={handleCandidateComplete}
              disabled={!selectedLocation}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
