import {
    uploadFile,
    getPublicUrl,
    deleteFile,
    listFiles,
  } from "@/lib/supabase-storage";
  
  import type {
    UploadedFile,
  } from "./media.types";
  
  type UploadRepository = {
    bucket: string;
    folder: string;
    filename: string;
    file: File;
  };
  
  class MediaRepository {
  
    async upload({
      bucket,
      folder,
      filename,
      file,
    }: UploadRepository): Promise<UploadedFile> {
  
      const path =
        `${folder}/${filename}`;
  
      const publicUrl =
        await uploadFile(
          bucket,
          path,
          file
        );
  
      return {
        path,
        publicUrl,
      };
    }
  
    async delete(
      bucket: string,
      path: string
    ) {
      await deleteFile(bucket, path);
    }
  
    async list(
      bucket: string,
      folder: string
    ) {
      return listFiles(
        bucket,
        folder
      );
    }
  
    getPublicUrl(
      bucket: string,
      path: string
    ) {
      return getPublicUrl(
        bucket,
        path
      );
    }
  }
  
  export const mediaRepository =
    new MediaRepository();