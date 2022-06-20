export const getImageUrl = ({
  url,
  width,
  height,
  mime_type,
  quality = 85,
  dpr = 2,
  fit = "cover",
  noAnimation,
}: {
  url: string;
  width: number;
  height?: number;
  mime_type?: string | null;
  quality?: number;
  dpr?: number;
  fit?: "crop" | "cover" | "scale-down" | null;
  noAnimation?: boolean;
}): string => {
  // We have already done cropping, so respect the cropping that is already applied
  if (
    url.startsWith("https://cdn.lu.ma/cdn-cgi/image/") ||
    url.startsWith("https://cdn.glow.app/cdn-cgi/image/")
  ) {
    return url;
  }

  // Don't use Cloudflare resizing for gifs to avoid animated gifs falling foul
  // of max frame/size limits.
  if (mime_type === "image/gif" || url.endsWith(".gif")) {
    return url;
  }

  const parsedUrl = new URL(url);

  // We can only do cropping on our domain
  if (
    parsedUrl.origin !== "https://cdn.lu.ma" &&
    parsedUrl.origin !== "https://cdn.glow.app"
  ) {
    return url;
  }

  let cdnUrl = parsedUrl.origin;
  cdnUrl += "/cdn-cgi/image/";

  // Cloudflare Image URL Options - https://developers.cloudflare.com/images/url-format
  const options = ["format=auto"];
  if (fit) {
    options.push(`fit=${fit}`);
  }
  if (dpr) {
    options.push(`dpr=${dpr}`);
  }
  if (noAnimation) {
    options.push(`anim=false`);
  }
  if (quality) {
    options.push(`quality=${quality}`);
  }
  if (width) {
    options.push(`width=${width}`);
  }
  if (height) {
    options.push(`height=${height}`);
  }
  cdnUrl += options.join(",");

  return cdnUrl + parsedUrl.pathname;
};
