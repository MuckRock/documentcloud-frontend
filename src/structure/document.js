import { Svue } from 'svue';
import { handlePlural } from '@/util/string';

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
          return [id, slug].join('-');
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
        thumbnail(assetUrl, id, slug) {
          // Calculate thumbnail route
          // TODO: last modified
          return `${assetUrl}documents/${id}/pages/${slug}-p1-normal.gif`;
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

        // Access properties
        access(doc) {
          return doc.access;
        },
        privateAccess(access) {
          return access == 'private';
        },
        publicAccess(access) {
          return access == 'public';
        },
        organizationAccess(access) {
          return access == 'organization';
        },

        // Status and processing-related properties
        status(doc) {
          return doc.status;
        },
        success(status) {
          return status == 'success';
        },
        pending(status) {
          return status == 'pending';
        },
        deleted(status) {
          return status == 'deleted';
        },
        error(status) {
          return status == 'error';
        },
        nofile(status) {
          return status == 'nofile';
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
        // Text properties
        userOrgString(individualOrg, userName, organizationName) {
          // Return user and organization formatted as a string
          if (individualOrg) {
            return userName;
          }
          return `${userName} (${organizationName})`
        },
        pageCountString(pageCount) {
          if (pageCount == 0) return '';
          return handlePlural(pageCount, 'page', true);
        },
        createdAtString(createdAt) {
          return createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        },
        summary(pageCountString, userOrgString, createdAtString) {
          return [pageCountString, userOrgString, createdAtString].filter(x => x.length > 0).join(' - ')
        },
      }
    });
  }
}
