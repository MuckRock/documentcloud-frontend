import { Svue } from "svue";
import { uniquify } from "@/util/array";
import { pageSizesFromSpec } from "@/api/pageSize";
import { Note } from "@/structure/note";
import { Section } from "@/structure/section";
import deepEqual from "fast-deep-equal";
import deepCopy from "fast-copy";

const HIGHLIGHT_START = process.env.HIGHLIGHT_START;
const HIGHLIGHT_END = process.env.HIGHLIGHT_END;
const PAGE_NO_RE = /^page_no_(\d+)$/;

const TAG_KEY = process.env.TAG_KEY;
const APP_URL = process.env.APP_URL;

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
        canonicalUrl(slugId) {
          return `${APP_URL}documents/${slugId}`;
        },
        pageHashUrl() {
          return (page) => `#document/p${page}`;
        },
        noteHashUrl(pageHashUrl) {
          return (note) => `${pageHashUrl(note.page + 1)}/a${note.id}`;
        },
        pageUrl(canonicalUrl, pageHashUrl) {
          return (page) => `${canonicalUrl}${pageHashUrl(page)}`;
        },
        canonicalPageUrl(canonicalUrl) {
          return (page) => `${canonicalUrl}/pages/${page}`;
        },
        relativeCanonicalUrl(slugId) {
          return `/documents/${slugId}`;
        },
        relativePageUrl(relativeCanonicalUrl, pageHashUrl) {
          return (page) => `${relativeCanonicalUrl}${pageHashUrl(page)}`;
        },
        noteUrl(pageUrl) {
          return (note) => `${pageUrl(note.page + 1)}/a${note.id}`;
        },
        relativeNoteUrl(relativePageUrl) {
          return (note) => `${relativePageUrl(note.page + 1)}/a${note.id}`;
        },
        fakeNoteUrl(canonicalUrl) {
          return (note) => `${canonicalUrl}/annotations/${note.id}`;
        },
        canonicalNoteUrl(fakeNoteUrl) {
          return fakeNoteUrl;
        },
        title(doc) {
          return doc.title;
        },
        description(doc) {
          return doc.description;
        },
        source(doc) {
          return doc.source;
        },
        relatedArticleUrl(doc) {
          return doc.related_article;
        },
        publishedUrl(doc) {
          return doc.published_url;
        },
        pageCount(doc) {
          return doc.page_count;
        },
        publishAt(doc) {
          return doc.publish_at;
        },
        user(doc) {
          return doc.user;
        },
        userName(user) {
          return user.name;
        },
        userId(user) {
          return user.id;
        },
        organization(doc) {
          // Unprocessed organization object
          return doc.organization;
        },
        orgId(organization) {
          return organization.id;
        },
        individualOrg(organization) {
          return organization.individual;
        },
        organizationName(organization) {
          return organization.name;
        },
        assetUrl(doc) {
          return doc.asset_url;
        },
        language(doc) {
          return doc.language;
        },
        pdf(assetUrl, id, slug) {
          return `${assetUrl}documents/${id}/${slug}.pdf`;
        },
        thumbnail(assetUrl, id, slug, updatedAtTimestamp) {
          // Calculate thumbnail route
          return `${assetUrl}documents/${id}/pages/${slug}-p1-small.gif?ts=${updatedAtTimestamp}`;
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
        pageSizes(pageSpec, pageCount) {
          if (pageSpec == null) return null;
          return pageSizesFromSpec(pageSpec).slice(0, pageCount);
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
        editAccess(doc) {
          if (doc.edit_access == null) return false;
          return doc.edit_access;
        },
        noindex(doc) {
          return doc.noindex;
        },
        adminNoindex(doc) {
          return doc.admin_noindex;
        },

        // Status and processing-related properties
        status(doc) {
          return doc.status;
        },
        success(status) {
          return status == "success";
        },
        readable(status) {
          return status == "readable";
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
        processing(pending, readable) {
          return pending || readable;
        },
        viewable(success, readable, editAccess) {
          return success || (readable && editAccess);
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

        // Metadata

        // Projects
        projectIds(doc) {
          return doc.projects == null ? [] : doc.projects;
        },

        // Notes/sections
        notes(doc) {
          return doc.notes == null
            ? []
            : doc.notes.map((note) => new Note(note));
        },
        notesDict(notes) {
          const dict = {};
          notes.forEach((note) => (dict[note.id] = note));
          return dict;
        },
        sections(doc) {
          return doc.sections == null
            ? []
            : doc.sections.map((section) => new Section(section));
        },

        // Data
        rawData(doc) {
          return doc.data;
        },
        dataPoints(rawData) {
          const results = [];
          for (const key in rawData) {
            if (rawData.hasOwnProperty(key)) {
              const values = uniquify(rawData[key], (x) => x);
              for (let i = 0; i < values.length; i++) {
                results.push({
                  key,
                  value: values[i],
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
            highlightEnd,
          );
        },
        rawNoteHighlights(doc) {
          return doc.note_highlights;
        },
        noteHighlights(
          rawNoteHighlights,
          notesDict,
          highlightStart,
          highlightEnd,
        ) {
          if (rawNoteHighlights == null) return null;
          return transformNoteHighlights(
            rawNoteHighlights,
            notesDict,
            highlightStart,
            highlightEnd,
          );
        },

        // Text properties
        userOrgString(individualOrg, userName, organizationName) {
          if (userName == null) return "";
          // Return user and organization formatted as a string
          if (individualOrg || organizationName == null) {
            return userName;
          }
          return `${userName} (${organizationName})`;
        },
        orgString(individualOrg, userName, organizationName) {
          if (individualOrg || organizationName == null) {
            return userName;
          }
          return organizationName;
        },
      },
    });
  }
}

export function docEquals(doc1, doc2) {
  return deepEqual(doc1.doc, doc2.doc);
}

export function copyDoc(doc) {
  return new Document(deepCopy(doc.doc));
}

export function transformPassage(passage, highlightStart, highlightEnd) {
  const chunks = [];

  const advance = (numChars) => {
    passage = passage.substr(numChars);
  };

  const pushRaw = (numChars) => {
    if (numChars == null) numChars = passage.length;
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "normal",
    });
    advance(numChars);
  };

  const pushHighlight = (numChars) => {
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "highlight",
    });
    advance(numChars);
  };

  while (passage.length > 0) {
    let foundHighlight = false;
    let idxStart = passage.indexOf(highlightStart);
    if (idxStart != -1) {
      let idxEnd = passage.indexOf(
        highlightEnd,
        idxStart + highlightStart.length,
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
  returnDict = false,
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
          transformPassage(passage, highlightStart, highlightEnd),
        );
      }
      // Handle response type
      if (returnDict) {
        if (highlights[page] == null) {
          pages.push({ page, count: highlight.passages.length });
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
    pages.sort((a, b) => a.page - b.page);
    return { highlights, pages };
  }
}

export function transformNoteHighlights(
  rawNoteHighlights,
  notesDict,
  highlightStart,
  highlightEnd,
) {
  const highlights = [];
  const pages = [];
  for (const noteKey in rawNoteHighlights) {
    if (rawNoteHighlights.hasOwnProperty(noteKey)) {
      // Populate highlight object
      const highlight = {
        note: notesDict[noteKey],
        titlePassages: [],
        hlContent: notesDict[noteKey].content,
      };
      const titlePassages = rawNoteHighlights[noteKey].title;
      const hlContent = rawNoteHighlights[noteKey].description;
      if (titlePassages) {
        for (let i = 0; i < titlePassages.length; i++) {
          const passage = titlePassages[i];
          // Transform passage
          highlight.titlePassages.push(
            transformPassage(passage, highlightStart, highlightEnd),
          );
        }
      } else {
        highlight.titlePassages.push([
          { type: "normal", text: notesDict[noteKey].title },
        ]);
      }
      if (hlContent) {
        highlight.hlContent = hlContent;
      }

      highlights.push(highlight);
    }
  }

  return highlights;
}
