export function slugify(str: string, id = null, maxLength = 25) {
  const slug = str
    .substring(0, maxLength)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (id != null) return `${id}-${slug}`;
  return slug;
}
