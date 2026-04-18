/**
 * Optimizes Cloudinary URLs by inserting transformation parameters.
 * @param url The original Cloudinary URL
 * @param width Optional width for resizing
 * @param isThumbnail If true, uses fill/thumb crop instead of limit
 * @returns Optimized URL string
 */
export const optimizeCloudinaryUrl = (
  url: string,
  width?: number,
  isThumbnail: boolean = false
): string => {
  if (!url || !url.includes("cloudinary.com")) return url;

  // Insert f_auto, q_auto after '/upload/'
  const splitUrl = url.split("/upload/");
  if (splitUrl.length !== 2) return url;

  const baseUrl = splitUrl[0];
  const rest = splitUrl[1];

  // Best practices: f_auto (format), q_auto:eco (aggressive size reduction), dpr_auto (device pixel ratio)
  const transformations = ["f_auto", "q_auto:eco", "dpr_auto"];

  if (width) {
    transformations.push(`w_${width}`);
    // If it's a thumbnail, we usually want to fill the square/bounds
    transformations.push(isThumbnail ? "c_fill" : "c_limit");
  } else {
    transformations.push("c_limit");
  }

  const transformationStr = transformations.join(",");

  return `${baseUrl}/upload/${transformationStr}/${rest}`;
};

/**
 * Generates a Cloudinary srcSet for responsive images.
 * @param url The original Cloudinary URL
 * @param widths Array of widths to generate (e.g. [400, 800, 1200])
 * @param isThumbnail If true, uses fill/thumb crop
 * @returns React-compatible srcSet string
 */
export const getCloudinarySrcSet = (
  url: string,
  widths: number[] = [400, 800, 1200],
  isThumbnail: boolean = false
): string => {
  return widths
    .map((w) => `${optimizeCloudinaryUrl(url, w, isThumbnail)} ${w}w`)
    .join(", ");
};
