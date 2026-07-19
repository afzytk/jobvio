import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyToJob } from "../api/apiApplications";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";

const schema = z.object({
  experience: z
    .number()
    .min(0, { message: "Experience must be at least 0" })
    .int(),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    errorMap: () => ({ message: "Education is required" }),
  }),
  resume: z
    .any()
    .refine((file) => file && file.length > 0, {
      message: "Resume file is required",
    })
    .refine(
      (file) =>
        file[0] &&
        (file[0].type === "application/pdf" ||
          file[0].type === "application/msword" ||
          file[0].type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      { message: "Only PDF or Word documents are allowed" },
    ),
});

const ApplyJobDrawer = ({ job, user, applied = false, fetchJob }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingApply,
    error: errorApply,
    fn: fnApply,
  } = useFetch(applyToJob);

  const onSubmit = (data) => {
    fnApply({
      ...data,
      job_id: job.id,
      candidate_id: user.id,
      name: user.fullName,
      status: "applied",
      data: data.resume[0],
    }).then(() => {
      fetchJob();
      reset();
    });
  };

  return (
    <div>
      <Drawer open={applied ? false : undefined}>
        <DrawerTrigger asChild>
          <Button
            size="lg"
            variant={job?.isOpen && !applied ? "blue" : "destructive"}
            disabled={!job?.isOpen || applied}
          >
            {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Apply for {job?.title} at {job?.company?.name}
            </DrawerTitle>
            <DrawerDescription>Please fill the form below</DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 p-4 pb-0"
          >
            <Input
              type="number"
              placeholder="Years of experience"
              className="flex-1"
              {...register("experience", { valueAsNumber: true })}
            />
            {errors.experience && (
              <p className="text-red-500">{errors.experience.message}</p>
            )}

            <Input
              type="text"
              placeholder="Skills (comma separated)"
              className="flex-1"
              {...register("skills")}
            />
            {errors.skills && (
              <p className="text-red-500">{errors.skills.message}</p>
            )}

            <Controller
              name="education"
              control={control}
              render={({ field: { onChange, value, name } }) => (
                <RadioGroup
                  name={name}
                  value={value || ""}
                  onValueChange={onChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Graduate" id="graduate" />
                    <Label htmlFor="graduate">Graduate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Post Graduate" id="post-graduate" />
                    <Label htmlFor="post-graduate">Post Graduate</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {errors.education && (
              <p className="text-red-500">{errors.education.message}</p>
            )}

            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              className="flex-1 file:text-gray-500"
              {...register("resume")}
            />
            {errors.resume && (
              <p className="text-red-500">{errors.resume.message}</p>
            )}

            {errorApply?.message && (
              <p className="text-red-500">{errorApply?.message}</p>
            )}
            {loadingApply && <BarLoader width={"100%"} color="#36d7b7" />}
            <Button
              type="submit"
              variant="blue"
              size="lg"
              disabled={loadingApply}
            >
              Apply
            </Button>
          </form>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ApplyJobDrawer;
