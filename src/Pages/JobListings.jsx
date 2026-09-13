import { useUser } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import { State } from "country-state-city";
import { getJobs } from "../api/apiJobs";
import { getExternalJobs } from "../api/apiExternalJobs";
import useFetch from "../hooks/use-fetch";
import JobCard from "../components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JobListings = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // applied on submit, not per keystroke
  const [location, setLocation] = useState("");

  const { isLoaded, user } = useUser();

  // Get candidate's preferred location from user metadata
  const userLocation =
    user?.unsafeMetadata?.role === "candidate"
      ? user?.unsafeMetadata?.location
      : null;

  // Set default location when user data is loaded
  useEffect(() => {
    if (isLoaded && userLocation && !location) {
      setLocation(userLocation);
    }
  }, [isLoaded, userLocation, location]);

  const {
    fn: fnJobs,
    data: jobs,
    loading: loadingInternalJobs,
  } = useFetch(getJobs, {
    location,
    searchQuery,
  });

  const {
    fn: fnExternalJobs,
    data: externalJobs,
    loading: loadingExternalJobs,
  } = useFetch(getExternalJobs, {
    location,
  });

  useEffect(() => {
    if (isLoaded) {
      fnJobs();
      fnExternalJobs();
    }
  }, [isLoaded, location, searchQuery, fnJobs, fnExternalJobs]);

  // External jobs are filtered client-side; internal filtering happens in the query.
  const allJobs = useMemo(() => {
    const internalJobs = jobs || [];
    const external = externalJobs || [];

    const query = searchQuery.toLowerCase();
    const filteredExternal = query
      ? external.filter((job) =>
          job.title.toLowerCase().includes(query),
        )
      : external;

    return [...internalJobs, ...filteredExternal].sort((a, b) => {
      const dateA = new Date(a.posted_date || a.created_at || 0);
      const dateB = new Date(b.posted_date || b.created_at || 0);
      return dateB - dateA;
    });
  }, [jobs, externalJobs, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setLocation("");
  };

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }
  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl md:text-7xl text-center pb-8">
        Latest Jobs
      </h1>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="h-14 flex w-full gap-2 items-center mb-3"
      >
        <Input
          type="text"
          placeholder="Search jobs by title"
          name="search-query"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-full flex-1 px-4 text-md"
        />
        <Button type="submit" className="h-full sm:w-28" variant="blue">
          Search
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by location" />
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
          variant="destructive"
          className="sm:w-1/2"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>

      {(loadingInternalJobs || loadingExternalJobs) && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}

      {loadingInternalJobs === false && loadingExternalJobs === false && (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allJobs.length ? (
            allJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                savedInit={job?.saved?.length > 0}
                isExternal={job.external || false}
              />
            ))
          ) : (
            <div>No Jobs Found 😢</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobListings;