import { getSupabaseClient } from "../utils/supabase";

export async function getCompanies(token) {
  const supabase = await getSupabaseClient(token);

  const { data, error } = await supabase.from("companies").select("*");
  if (error) {
    console.error("Error fetching companies", error);
  }
  return data;
}

export async function addNewCompany(token, _, companyData) {
  const supabase = await getSupabaseClient(token);

  const random = Math.floor(Math.random() * 90000);
  const fileName = `logo-${random}-${companyData.name}`;

  const { error: storageError } = await supabase.storage
    .from("company-logo")
    .upload(fileName, companyData.logo);

  if (storageError) {
    console.error("DETAILED STORAGE ERROR:", storageError);
    throw new Error("Error uploading Company Logo");
  }

  const { data: urlData } = supabase.storage
    .from("company-logo")
    .getPublicUrl(fileName);

  const logo_url = urlData.publicUrl;

  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        name: companyData.name,
        logo_url: logo_url,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error submitting Company");
  }

  return data;
}
