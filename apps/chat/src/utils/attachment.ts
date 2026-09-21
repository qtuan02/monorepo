/**
 * The backend renames every upload to a generated id, so the original
 * filename never reaches the client — only the extension in the URL's own
 * last path segment survives (contract §5c).
 */
export function getFileExtensionFromUrl(url: string): string {
  const path = url.split(/[?#]/)[0] ?? url;
  const name = path.split("/").pop() ?? "";
  const dotIndex = name.lastIndexOf(".");
  return dotIndex > 0 ? name.slice(dotIndex + 1) : "";
}
