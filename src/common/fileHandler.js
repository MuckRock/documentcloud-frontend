import { includes } from "@/util/array.js";

const documentTypes = import.meta.env.DC_DOCUMENT_TYPES.split(",").map(
  (x) => `.${x.toLowerCase().trim()}`,
);

export function filterFiles(files) {
  // Filter for just valid files
  return files.filter((file) => {
    return includes(documentTypes, file.name.toLowerCase().trim(), (a, b) =>
      b.endsWith(a),
    );
  });
}
