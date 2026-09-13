import { useUser } from "@clerk/clerk-react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/use-fetch";
import { getSingleJob, updateHiringStatus } from "../api/apiJobs";
import { getExternalJobById } from "../api/apiExternalJobs";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from "lucide-react";
import JobMarkdown from "../components/JobMarkdown";
import StructuredText from "../components/StructuredText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ApplyJobDrawer from "../components/ApplyJob";
import ApplicationCard from "../components/ApplicationCard";

const Job = () => {
  const { isLoaded, user } = useUser();
  const { id } = useParams();

  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  // Check if this is an external job (non-numeric ID)
  const isExternalJob = id && !/^[0-9]+$/.test(id);

  const {
    loading: loadingJob,
    data: job,
    fn: fnJob,
  } = useFetch(isExternalJob ? getExternalJobById : getSingleJob, { job_id: id });

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateHiringStatus,
    { job_id: id },
  );

  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus(isOpen).then(() => fnJob());
  };

  useEffect(() => {
    if (isLoaded) fnJob();
  }, [isLoaded, fnJob]);

  if (!isLoaded || loadingJob) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/jobs">
          <Button variant="blue">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-5">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">
          {job?.title}
        </h1>
        {isExternalJob ? (
          job?.logo_url ? (
            <img src={job.logo_url} className="h-12" alt={job?.title} />
          ) : (
            <div className="text-xl font-semibold">{job?.company}</div>
          )
        ) : (
          <img src={job?.company?.logo_url} className="h-12" alt={job?.title} />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <MapPinIcon />
          {job?.location}
        </div>
        {isExternalJob ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {job?.salary && job.salary !== "Not specified" && (
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-md font-medium">
                {job.salary}
              </span>
            )}
            {job?.type && (
              <span className="bg-muted text-muted-foreground px-3 py-1 rounded-md font-medium">
                {job.type}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <Briefcase />
              {job?.applications?.length} applicants
            </div>

            <div className="flex gap-2">
              {job?.isOpen ? (
                <>
                  <DoorOpen />
                  Open
                </>
              ) : (
                <>
                  <DoorClosed />
                  Closed
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hiring status — internal jobs only */}
      {!isExternalJob && loadingHiringStatus && (
        <BarLoader width={"100%"} color="#36d7b7" />
      )}
      {!isExternalJob && job?.recruiter_id === user?.id && (
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger
            className={`w-full ${job?.isOpen ? "bg-green-950" : "bg-red-950"}`}
          >
            <SelectValue
              placeholder={
                "Hiring Status" + (job?.isOpen ? "(open)" : "(closed)")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <StructuredText text={job?.description} asHtml={isExternalJob} />

      <h2 className="text-2xl sm:text-3xl font-bold">
        What we are looking for{" "}
      </h2>
      {isExternalJob ? (
        <StructuredText text={job?.requirements} asHtml />
      ) : (
        <JobMarkdown source={job?.requirements} className="sm:text-lg" />
      )}

      {/* Apply section — external jobs link out, internal jobs use the drawer */}
      {isExternalJob ? (
        !isRecruiter && (
          <a
            href={job?.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="blue" className="w-full" size="lg">
              Apply on Company Site
            </Button>
          </a>
        )
      ) : (
        <>
          {/* Applicant list (owner view) */}
          {!isRecruiter && job?.recruiter_id !== user?.id && (
            <ApplyJobDrawer
              job={job}
              user={user}
              fetchJob={fnJob}
              applied={job?.applications?.find(
                (ap) => ap.candidate_id === user.id,
              )}
            />
          )}

          {job?.applications?.length > 0 && job?.recruiter_id === user?.id && (
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Applications</h2>
              {job?.applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Job;
