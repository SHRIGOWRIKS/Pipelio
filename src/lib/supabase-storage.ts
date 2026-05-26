import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKET = "resumes";

export async function uploadResume(
  file: File,
  userId: string
): Promise<{ url: string; path: string } | { error: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowed = ["pdf", "doc", "docx"];
  if (!ext || !allowed.includes(ext)) {
    return { error: "Only PDF, DOC, DOCX files are allowed." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File must be under 5MB." };
  }

  const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return { url: data.publicUrl, path: fileName };
}

export async function deleteResume(path: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([path]);
}
