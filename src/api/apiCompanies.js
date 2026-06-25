import { getSupabaseClient } from "../utils/supabase";

export async function getCompanies(token) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("companies").select("*");
  if (error) {
    console.error("Error fetching companies", error);
  }
  return data;
}
