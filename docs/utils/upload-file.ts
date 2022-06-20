import axios from "axios";
import { ApiClient } from "./api-client";

const MAX_IMAGE_SIZE = 50_000_000; // 50 megabytes

export class FileTooBigError extends Error {
  message = "The file is too big. Please choose a file that's under 50 MB.";
}

export const uploadImageToS3 = async ({
  file,
  onUploadProgress,
}: {
  file: File;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}): Promise<{ file_url: string }> => {
  if (file.size > MAX_IMAGE_SIZE) {
    throw new FileTooBigError();
  }

  const { upload_url, file_url } = await ApiClient.post(
    "/cdn/create-presigned-url",
    {
      extension: "png",
      destination: {
        bucket: "cdn.glow.app",
        folder: "n",
      },
    }
  );

  await axios.put(upload_url, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress,
  });

  return { file_url };
};

export const uploadJsonToS3 = async ({
  json,
}: {
  json: any;
}): Promise<{ file_url: string }> => {
  const { upload_url, file_url } = await ApiClient.post(
    "/cdn/create-presigned-url",
    {
      destination: { bucket: "cdn.glow.app", folder: "n" },
      extension: "json",
      contentType: "application/json",
    }
  );

  await axios.put(upload_url, Buffer.from(JSON.stringify(json), "utf-8"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return { file_url };
};
