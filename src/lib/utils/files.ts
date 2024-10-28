import type { Maybe } from "$lib/api/types";
import {
  DOCUMENT_TYPES,
  PDF_SIZE_LIMIT,
  DOCUMENT_SIZE_LIMIT,
} from "@/config/config.js";

const types = new Set(DOCUMENT_TYPES);

export function getFileExtensionFromType(filetype?: string) {
  if (filetype?.includes("/")) {
    return filetype.split("/")[1];
  }
  return filetype;
}

export function getFileExtension(file?: File): Maybe<string> {
  if (!file) return;
  if (file.name.includes(".")) {
    return file.name.toLowerCase().trim().split(".").pop();
  } else if (file.type) {
    return getFileExtensionFromType(file.type);
  }
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
  const [name, ...ext] = filename.split(".");
  if (!name) return filename;
  return name.replace(/_/g, " ");
}
