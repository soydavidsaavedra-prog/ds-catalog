import { supabase } from "./supabase";

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
    });

  if (error) throw error;

  return getPublicUrl(bucket, path);
}

export function getPublicUrl(
  bucket: string,
  path: string
) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteFile(
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

export async function listFiles(
  bucket: string,
  folder: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder);

  if (error) throw error;

  return data;
}