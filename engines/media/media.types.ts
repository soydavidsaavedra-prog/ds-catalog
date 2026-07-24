export type UploadFile = {
    bucket: string;
    folder: string;
    file: File;
  };
  
  export type UploadedFile = {
    path: string;
    publicUrl: string;
  };