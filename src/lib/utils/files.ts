import {
  DOCUMENT_TYPES,
  PDF_SIZE_LIMIT,
  DOCUMENT_SIZE_LIMIT,
} from "@/config/config.js";

const types = new Set(DOCUMENT_TYPES);

export function getFileExtensionFromType(filetype?: string): string {
  if (filetype?.includes("/")) {
    return filetype.split("/")[1] ?? "";
  }
  return filetype ?? "";
}

export function getFileExtension(file?: File): string {
  if (!file) return "";
  if (file.name.includes(".")) {
    return file.name.toLowerCase().trim().split(".").pop() ?? "";
  } else if (file.type) {
    return getFileExtensionFromType(file.type) ?? "";
  }
  return "";
}

export function isSupported(file: File): boolean {
  const extension = getFileExtension(file);
  if (!extension) return false;
  return types.has(extension);
}

/** Returns an array of only files with supported types */
export function removeUnsupportedTypes(files: File[]) {
  return files.filter(isSupported);
}

export function isWithinSizeLimit(file: File) {
  const { size } = file;
  const extension = getFileExtension(file);
  if (extension === "pdf") {
    return size <= PDF_SIZE_LIMIT;
  } else {
    return size <= DOCUMENT_SIZE_LIMIT;
  }
}

export function filenameToTitle(filename: string): string {
  const name = stripExtension(filename);
  return name.replace(/_/g, " ");
}

/**
 * Strips the extension part of a filename
 * @param {string} filename The filename
 */
export function stripExtension(filename: string) {
  const parts = filename.split(".");
  const ext = parts[parts.length - 1] ?? "";

  // strip only known extensions
  if (types.has(ext)) {
    return parts.slice(0, parts.length - 1).join(".");
  }
  return filename;
}
