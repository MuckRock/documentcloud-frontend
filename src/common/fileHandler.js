import { includes } from "@/util/array.js";
import { DOCUMENT_TYPES } from "../config/config.js";

export function filterFiles(files) {
  // Filter for just valid files
  return files.filter((file) => {
    return includes(DOCUMENT_TYPES, file.name.toLowerCase().trim(), (a, b) =>
      b.endsWith(a),
    );
  });
}
