// See https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const URL_REGEX =
  /(http(s)?:\/\/.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export const startsWithHttp = (url: string): boolean => {
  return (
    url.toLowerCase().startsWith("http://") ||
    url.toLowerCase().startsWith("https://")
  );
};

export const isAbsoluteUrl = (url: string) => {
  if (typeof url !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof url}\``);
  }

  const isUrl = URL_REGEX.test(url);
  if (!isUrl) {
    return false;
  }

  return startsWithHttp(url);
};

export const normalizeUrl = (url: string): string | null => {
  const isUrl = URL_REGEX.test(url);

  if (!isUrl) {
    return null;
  }

  if (isAbsoluteUrl(url)) {
    return url;
  }

  return "http://" + url;
};
