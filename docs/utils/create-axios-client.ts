import { z } from "zod";
import axios, { AxiosRequestHeaders } from "axios";
import { Duration } from "luxon";

type ApiBase = Record<
  string,
  {
    request: z.ZodSchema<any>;
    response: z.ZodSchema<any>;
  }
>;

type ApiClient<GetTypes extends ApiBase, PostTypes extends ApiBase> = {
  get: <
    Path extends keyof GetTypes & string,
    Request extends GetTypes[Path]["request"],
    Response extends GetTypes[Path]["response"]
  >(
    path: Path,
    params: z.infer<Request>
  ) => Promise<z.infer<Response>>;
  post: <
    Path extends keyof PostTypes & string,
    Request extends PostTypes[Path]["request"],
    Response extends PostTypes[Path]["response"]
  >(
    path: Path,
    data: z.infer<Request>
  ) => Promise<z.infer<Response>>;
};

export const createAxiosClient = <
  GetTypes extends ApiBase,
  PostTypes extends ApiBase
>({
  getSchema,
  postSchema,
  baseUrl,
  headers,
  timeout,
  onRequest,
}: {
  getSchema: GetTypes;
  postSchema: PostTypes;
  baseUrl?: string;
  headers?: AxiosRequestHeaders;
  timeout?: Duration;
  onRequest?: {
    before?: (args: { path: string; method: string }) => void;
    after?: (args: {
      path: string;
      method: string;
      duration_ms: number;
      error: boolean;
    }) => void;
  };
}): ApiClient<GetTypes, PostTypes> => {
  type ReturnType = ApiClient<GetTypes, PostTypes>;
  const axiosClient = axios.create({
    baseURL: baseUrl,
    headers,
    timeout: timeout?.as("millisecond"),
  });

  const get: ReturnType["get"] = async (path, _params) => {
    const parser = getSchema[path];

    onRequest?.before?.({ path, method: "get" });

    try {
      const params = parser.request.parse(_params);
      const { data } = await axiosClient.get(path, { params });

      onRequest?.after?.({ path, method: "get", duration_ms: 0, error: false });

      return parser.response.parse(data);
    } catch (e) {
      console.error("Error in API Client", e);
      onRequest?.after?.({ path, method: "get", duration_ms: 0, error: true });
      throw e;
    }
  };

  const post: ReturnType["post"] = async (path, _postData) => {
    const parser = postSchema[path];

    onRequest?.before?.({ path, method: "post" });

    try {
      const postData = parser.request.parse(_postData);
      const { data } = await axiosClient.post(path, postData);

      onRequest?.after?.({
        path,
        method: "post",
        duration_ms: 0,
        error: false,
      });

      return parser.response.parse(data);
    } catch (e) {
      console.error("Error in API Client", e);
      onRequest?.after?.({ path, method: "post", duration_ms: 0, error: true });
      throw e;
    }
  };

  return { get, post };
};
