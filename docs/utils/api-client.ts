import * as z from "zod";
import { Duration } from "luxon";
import { createAxiosClient } from "./create-axios-client";

export const ApiClient = createAxiosClient({
  getSchema: {},
  postSchema: {
    "/cdn/create-presigned-url": {
      request: z.object({
        extension: z.string(),
        folder: z.string(),
        bucket: z.string(),
      }),
      response: z.object({ upload_url: z.string(), file_url: z.string() }),
    },
  },
  baseUrl: "https://api.glow.app",
  timeout: Duration.fromObject({ seconds: 5 }),
});
