import { Svue } from "svue";
import { handlePlural } from "@/util/string";
import { uniquify } from "@/util/array";

const HIGHLIGHT_START = process.env.HIGHLIGHT_START;
const HIGHLIGHT_END = process.env.HIGHLIGHT_END;
const PAGE_NO_RE = /^page_no_(\d+)$/;

const TAG_KEY = process.env.TAG_KEY;

export class Document extends Svue {
  constructor(rawDocument, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.doc = rawDocument;
        data.lastProgress = null;
        data.lastImagesProcessed = null;
        data.lastTextsProcessed = null;
        data.highlightStart = HIGHLIGHT_START;
        data.highlightEnd = HIGHLIGHT_END;
        return data;
      },
      computed: {
        ...computed,
        // Base properties
        id(doc) {
          return doc.id;
        },
        slug(doc) {
          return doc.slug;
        },
        slugId(id, slug) {
          return [id, slug].join("-");
        },
        title(doc) {
          return doc.title;
        },
        pageCount(doc) {
          return doc.page_count;
        },
        userName(doc) {
          return doc.user.name;
        },
        rawOrganization(doc) {
          // Unprocessed organization object
          return doc.organization;
        },
        individualOrg(rawOrganization) {
          return rawOrganization.individual;
        },
        organizationName(rawOrganization) {
          return rawOrganization.name;
        },
        assetUrl(doc) {
          return doc.asset_url;
        },
        thumbnail(assetUrl, id, slug, updatedAtTimestamp) {
          // Calculate thumbnail route
          // TODO: last modified
          return `${assetUrl}documents/${id}/pages/${slug}-p1-normal.gif?ts=${updatedAtTimestamp}`;
        },
        rawCreatedAt(doc) {
          // Unprocessed created at
          return doc.created_at;
        },
        createdAt(rawCreatedAt) {
          return new Date(Date.parse(rawCreatedAt));
        },
        rawUpdatedAt(doc) {
          // Unprocessed updated at
          return doc.updated_at;
        },
        updatedAtTimestamp(rawUpdatedAt) {
          return Date.parse(rawUpdatedAt);
        },
        updatedAt(updatedAtTimestamp) {
          return new Date(updatedAtTimestamp);
        },
        pageSpec(doc) {
          return doc.page_spec;
        },

        // Access properties
        access(doc) {
          return doc.access;
        },
        privateAccess(access) {
          return access == "private";
        },
        publicAccess(access) {
          return access == "public";
        },
        organizationAccess(access) {
          return access == "organization";
        },

        // Status and processing-related properties
        status(doc) {
          return doc.status;
        },
        success(status) {
          return status == "success";
        },
        pending(status) {
          return status == "pending";
        },
        deleted(status) {
          return status == "deleted";
        },
        error(status) {
          return status == "error";
        },
        nofile(status) {
          return status == "nofile";
        },
        nonPending(pending) {
          return !pending;
        },
        rawRemaining(doc) {
          return doc.remaining;
        },
        hasRemaining(rawRemaining) {
          return rawRemaining != null;
        },
        imagesRemaining(rawRemaining, hasRemaining) {
          if (!hasRemaining) return null;
          return rawRemaining.images;
        },
        textsRemaining(rawRemaining, hasRemaining) {
          if (!hasRemaining) return null;
          return rawRemaining.texts;
        },
        imagesProcessed(pageCount, imagesRemaining) {
          if (imagesRemaining == null) {
            return this.lastImagesProcessed;
          }
          if (pageCount == 0) {
            this.lastImagesProcessed = 0;
          } else {
            this.lastImagesProcessed = pageCount - imagesRemaining;
          }
          return this.lastImagesProcessed;
        },
        textsProcessed(pageCount, textsRemaining) {
          if (textsRemaining == null) {
            return this.lastTextsProcessed;
          }
          if (pageCount == 0) {
            this.lastTextsProcessed = 0;
          } else {
            this.lastTextsProcessed = pageCount - textsRemaining;
          }
          return this.lastTextsProcessed;
        },
        mightHaveThumbnail(success, imagesProcessed) {
          // Returns if at least one page image has been processed
          return success || imagesProcessed >= 1;
        },
        imageProgress(hasRemaining, imagesProcessed, pageCount) {
          if (!hasRemaining) return null;
          if (pageCount == 0) return 0;
          return imagesProcessed / pageCount;
        },
        textProgress(hasRemaining, textsProcessed, pageCount) {
          if (!hasRemaining) return null;
          if (pageCount == 0) return 0;
          return textsProcessed / pageCount;
        },
        processingProgress(hasRemaining, imageProgress, textProgress) {
          if (!hasRemaining) return null;
          // Overall processing progress is an average of image and text progress
          return (imageProgress + textProgress) / 2;
        },
        realProgress(processingProgress) {
          if (processingProgress == null) {
            return this.lastProgress;
          } else {
            this.lastProgress = processingProgress;
            return processingProgress;
          }
        },

        // Projects
        projectIds(doc) {
          return doc.projects == null ? [] : doc.projects;
        },

        // Data
        rawData(doc) {
          return doc.data;
        },
        dataPoints(rawData) {
          const results = [];
          for (const key in rawData) {
            if (rawData.hasOwnProperty(key)) {
              const values = uniquify(rawData[key], x => x);
              for (let i = 0; i < values.length; i++) {
                results.push({
                  key,
                  value: values[i]
                });
              }
            }
          }
          results.sort((a, b) => {
            // Sort by value if it's a tag
            const aKey = a.key == TAG_KEY ? a.value : a.key;
            const bKey = b.key == TAG_KEY ? b.value : b.key;
            const aValue = a.value;
            const bValue = b.value;

            const keyCompare = aKey.localeCompare(bKey);
            if (keyCompare != 0) return keyCompare;
            return aValue.localeCompare(bValue);
          });
          return results;
        },

        // Highlights
        rawHighlights(doc) {
          return doc.highlights;
        },
        highlights(rawHighlights, highlightStart, highlightEnd) {
          if (rawHighlights == null) return null;
          return transformHighlights(
            rawHighlights,
            highlightStart,
            highlightEnd
          );
        },

        // Text properties
        userOrgString(individualOrg, userName, organizationName) {
          // Return user and organization formatted as a string
          if (individualOrg) {
            return userName;
          }
          return `${userName} (${organizationName})`;
        },
        pageCountString(pageCount) {
          if (pageCount == 0) return "";
          return handlePlural(pageCount, "page", true);
        },
        createdAtString(createdAt) {
          return createdAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        },
        summary(pageCountString, userOrgString, createdAtString) {
          return [pageCountString, userOrgString, createdAtString]
            .filter(x => x.length > 0)
            .join(" - ");
        }
      }
    });
  }
}

export function transformPassage(passage, highlightStart, highlightEnd) {
  const chunks = [];

  const advance = numChars => {
    passage = passage.substr(numChars);
  };

  const pushRaw = numChars => {
    if (numChars == null) numChars = passage.length;
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "normal"
    });
    advance(numChars);
  };

  const pushHighlight = numChars => {
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "highlight"
    });
    advance(numChars);
  };

  while (passage.length > 0) {
    let foundHighlight = false;
    let idxStart = passage.indexOf(highlightStart);
    if (idxStart != -1) {
      let idxEnd = passage.indexOf(
        highlightEnd,
        idxStart + highlightStart.length
      );
      if (idxEnd != -1) {
        pushRaw(idxStart);
        advance(highlightStart.length);
        pushHighlight(idxEnd - idxStart - highlightStart.length);
        advance(highlightEnd.length);
        foundHighlight = true;
      }
    }
    if (!foundHighlight) break;
  }
  pushRaw();

  return chunks;
}

export function transformHighlights(
  rawHighlights,
  highlightStart,
  highlightEnd,
  returnDict = false
) {
  const highlights = returnDict ? {} : [];
  const pages = [];
  for (const pageKey in rawHighlights) {
    if (rawHighlights.hasOwnProperty(pageKey)) {
      // Get number out of page key
      const match = pageKey.match(PAGE_NO_RE);
      if (match == null) continue;
      const page = parseInt(match[1]) - 1;

      // Populate highlight object
      const highlight = { page, passages: [] };
      const passages = rawHighlights[pageKey];
      for (let i = 0; i < passages.length; i++) {
        const passage = passages[i];
        // Transform passage
        highlight.passages.push(
          transformPassage(passage, highlightStart, highlightEnd)
        );
      }
      // Handle response type
      if (returnDict) {
        if (highlights[page] == null) {
          pages.push(page);
        }
        highlights[page] = highlight.passages;
      } else {
        highlights.push(highlight);
      }
    }
  }

  // Sort results by page number
  if (!returnDict) {
    highlights.sort((a, b) => a.page - b.page);
    return highlights;
  } else {
    return { highlights, pages };
  }
}
