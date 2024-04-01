import { DOCUMENT_TYPES } from "@/config/config.js";

/** Returns an array of only files with supported types */
export function removeUnsupportedTypes(files: File[]) {
  return files.filter((file) => {
    if (!file.name.includes(".")) return false;
    const extension = file.name.toLowerCase().trim().split(".").pop();
    return DOCUMENT_TYPES.includes(extension);
  });
}
