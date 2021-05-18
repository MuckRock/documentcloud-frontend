import { extractSlugId, isNumber } from "@/util/string";

const languageOptions = process.env.LANGUAGE_CODES.split("|");

export const sortCompletions = [
  {
    type: "field",
    text: "Created At (Descending)",
    info: "Most Recent First",
    feed: "created_at",
  },
  {
    type: "field",
    text: "Created At (Ascending)",
    info: "Oldest First",
    feed: "-created_at",
  },
  {
    type: "field",
    text: "Title (Ascending)",
    info: "Document Title A-Z",
    feed: "title",
  },
  {
    type: "field",
    text: "Title (Descending)",
    info: "Document Title Z-A",
    feed: "-title",
  },
  {
    type: "field",
    text: "Page Count (Descending)",
    info: "Most Pages First",
    feed: "page_count",
  },
  {
    type: "field",
    text: "Page Count (Ascending)",
    info: "Least Pages First",
    feed: "-page_count",
  },
  {
    type: "field",
    text: "Source (Ascending)",
    info: "Document Source A-Z",
    feed: "source",
  },
  {
    type: "field",
    text: "Source (Descending)",
    info: "Document Source Z-A",
    feed: "-source",
  },
  {
    type: "field",
    text: "Score",
    info: "Default Sort Option by Relevance",
    feed: "score",
  },
];
const validSorts = sortCompletions.map((x) => x.feed);

export function fieldValid(text, example = false) {
  const fieldMatch = text.match(/^[^a-z]*([a-zA-Z0-9_-]+):(.*)$/);
  if (fieldMatch == null) return { valid: false };
  const field = fieldMatch[1];
  const value = fieldMatch[2];
  const id = extractSlugId(value);
  if (field == "project") {
    if (id == null) return { valid: false };
    if (example) return { valid: true, transform: `projects:${id}` };
    // IDs aren't checked for actual project, but will not return any useful results if not
    return { valid: isNumber(id) };
  } else if (field == "user") {
    if (id == null) return { valid: false };
    if (example) return { valid: true, transform: `user:${id}` };
    // IDs aren't checked for actual user, but will not return any useful results if not
    return { valid: isNumber(id) };
  } else if (field == "organization") {
    if (id == null) return { valid: false };
    if (example) return { valid: true, transform: `organization:${id}` };
    // IDs aren't checked for actual org, but will not return any useful results if not
    return { valid: isNumber(id) };
  } else if (field == "access") {
    return {
      valid: id == "public" || id == "organization" || id == "private",
    };
  } else if (field == "status") {
    return {
      valid:
        id == "success" ||
        id == "readable" ||
        id == "pending" ||
        id == "error" ||
        id == "nofile",
    };
  } else if (field == "sort") {
    return {
      valid: validSorts.includes(value),
    };
  } else if (field == "tag") {
    return {
      valid: value.trim().length > 0,
    };
  } else if (field == "language") {
    return {
      valid: id != null && languageOptions.includes(id),
    };
  } else if (field.startsWith("data_")) {
    return {
      valid: field.length > "data_".length && value.trim().length > 0,
    };
  } else {
    return {
      valid: false,
    };
  }
}
