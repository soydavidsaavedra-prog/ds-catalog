import { mediaRepository } from "./media.repository";

import type {
  UploadFile,
  UploadedFile,
} from "./media.types";

type DeleteFile = {
  bucket: string;
  path: string;
};

class MediaEngine {
  async upload({
    bucket,
    folder,
    file,
  }: UploadFile): Promise<UploadedFile> {

    const extension =
      file.name.split(".").pop() ?? "webp";

    const filename =
      `${crypto.randomUUID()}.${extension}`;

    return mediaRepository.upload({
      bucket,
      folder,
      filename,
      file,
    });
  }

  async delete({
    bucket,
    path,
  }: DeleteFile): Promise<void> {
    await mediaRepository.delete(
      bucket,
      path
    );
  }
}

export const mediaEngine =
  new MediaEngine();