import { includes } from '@/util/array';

const documentTypes = process.env.DOCUMENT_TYPES.split(",")
  .map((x) => `.${x.toLowerCase().trim()}`);

export function filterFiles(files) {
  // Filter for just valid files
  return files.filter(file => {
    return includes(documentTypes, file.name.toLowerCase().trim(), (a, b) => b.endsWith(a));
  });
}
