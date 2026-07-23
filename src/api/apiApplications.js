import { getSupabaseClient, supabaseUrl } from "../utils/supabase";

export async function applyToJob(token, _, jobData) {
  const supabase = await getSupabaseClient(token);
  const random = Math.floor(Math.random() * 9000);
  const filename = `resume-${random}-${jobData.candidate_id}`;

  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(filename, jobData.resume);

  if (storageError) {
    console.error("Error uploading resume", storageError);
    return null;
  }
  const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${filename}`;

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        ...jobData,
        resume,
      },
    ])
    .select();

  if (error) {
    console.error("Error submitting applications", error);
    return null;
  }
  return data;
}

export async function updateApplications(token, { job_id }, status) {
  const supabase = await getSupabaseClient(token);

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("job_id", job_id)
    .select();

  if (error || data.length === 0) {
    console.error("Error Updating Application Status:", error);
  }
  return data;
}
