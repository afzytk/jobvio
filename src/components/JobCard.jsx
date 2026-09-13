import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CalendarClock, Heart, MapPinIcon, Trash2Icon, ExternalLink, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { deleteJob, saveJobs } from "../api/apiJobs";
import { formatDate } from "../lib/utils";
import useFetch from "../hooks/use-fetch";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const JobCard = ({
  job,
  isMyJob = false,
  savedInit = false,
  onJobSaved = () => {},
  onJobAction = () => {},
  isExternal = false,
}) => {
  const [saved, setSaved] = useState(savedInit);
  const {
    fn: fnSavedJob,
    data: savedJob,
    loading: loadingSavedJob,
  } = useFetch(saveJobs, {
    alreadySaved: saved,
  });

  const { user } = useUser();
  const isRecruiter = user?.unsafeMetadata?.role === "recruiter";

  const handleSaveJob = async () => {
    await fnSavedJob({
      user_id: user.id,
      job_id: job.id,
    });
    onJobSaved();
  };

  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  const handleDeleteJob = async () => {
    await fnDeleteJob();
    onJobAction();
  };

  // Sync saved state when savedJob data changes
  useEffect(() => {
    if (savedJob !== undefined) setSaved(savedJob?.length > 0);
  }, [savedJob]);

  // Truncate external (HTML) descriptions to their first sentence.
  const jobSummary = job?.description
    ? job.description
        .replace(/<[^>]*>/g, " ")
        .replace(/&[a-z]+;|&#\d+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(
          0,
          (() => {
            const periodIndex = job.description.replace(/<[^>]*>/g, " ").indexOf(".");
            return periodIndex !== -1 ? periodIndex : 120;
          })(),
        )
    : "";
  return (
    <Card className="flex flex-col">
      {loadingDeleteJob && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <CardHeader>
        <CardTitle className="flex justify-between font-bold items-start gap-2">
          <div className="flex flex-col gap-2">
            <span>{job.title}</span>
            {isExternal ? (
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                <ExternalLink size={10} />
                External
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                <Building2 size={10} />
                Internal
              </span>
            )}
          </div>
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-400 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {job.company && (
            typeof job.company === 'string' ? (
              <span className="font-semibold text-sm">{job.company}</span>
            ) : (
              <img src={job.company.logo_url} alt={job.title} className="h-6" />
            )
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} />
            {job.location}
          </div>
        </div>
        <hr />
        <p className="text-sm text-muted-foreground">{jobSummary}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CalendarClock size={12} />
          Posted on {formatDate(job?.external ? job?.posted_date : job?.created_at)}
        </p>
        {(job.salary || job.type) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {job.salary && job.salary !== "Not specified" && (
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                {job.salary}
              </span>
            )}
            {job.type && (
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                {job.type}
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {isExternal ? (
          <>
            <Link to={`/job/${encodeURIComponent(job.id)}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                More Details
              </Button>
            </Link>
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="blue"
                className="w-full flex items-center gap-2"
                disabled={!job.apply_url}
              >
                Apply
                <ExternalLink size={14} />
              </Button>
            </a>
          </>
        ) : (
          <Link to={`/job/${job.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              More Details
            </Button>
          </Link>
        )}
        {!isMyJob && !isExternal && !isRecruiter && (
          <Button
            variant="outline"
            className="w-16"
            onClick={handleSaveJob}
            disabled={loadingSavedJob}
          >
            {saved ? (
              <Heart size={20} stroke="red" fill="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
