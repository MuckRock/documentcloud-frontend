import session from './session';
import axios from 'axios';
import wrapLoad from './wrapload';
import { timeout } from '../api';
import Vue from 'vue';

function convertDoc(doc) {
  return new Vue({
    data() {
      return {
        doc,
        loading: false,
        linger: false,
        currentProcessingFinished: false,
      };
    },
    computed: {
      id() {
        return this.doc.id;
      },
      slug() {
        return this.doc.slug;
      },
      slugId() {
        return [this.doc.id, this.doc.slug].join('-');
      },
      assetUrl() {
        return this.doc.asset_url;
      },
      thumbnail() {
        // Calculate thumbnail route
        return `${this.assetUrl}documents/${this.id}/pages/${this.slug}-p1-normal.gif`;
      },
      mightHaveThumbnail() {
        // Returns if at least one page image has been processed
        return this.success || this.imagesProcessed >= 1;
      },
      title() {
        return this.doc.title;
      },
      pageCount() {
        return this.doc.page_count;
      },
      user() {
        return this.doc.user.name;
      },
      individualOrg() {
        return this.doc.organization.individual;
      },
      org() {
        return this.doc.organization.name;
      },
      userOrg() {
        // Return user and organization formatted as a string
        if (this.individualOrg) {
          return this.user;
        }
        return `${this.user} ${this.org}`
      },
      rawCreatedAt() {
        return this.doc.created_at;
      },
      createdAt() {
        return new Date(Date.parse(this.rawCreatedAt)).toLocaleDateString()
      },
      status() {
        return this.doc.status;
      },
      success() {
        return this.doc.status == 'success';
      },
      successPreLinger() {
        return this.doc.status == 'success' && this.linger;
      },
      successPostLinger() {
        return this.doc.status == 'success' && !this.linger;
      },
      pending() {
        return this.doc.status == 'pending';
      },
      deleted() {
        return this.doc.status == 'deleted';
      },
      nonPending() {
        return !this.pending;
      },
      error() {
        return this.doc.status == 'error';
      },
      imagesRemaining() {
        return this.doc.remaining.images;
      },
      textsRemaining() {
        return this.doc.remaining.texts;
      },
      imagesProcessed() {
        if (this.pageCount == 0) return 0;
        return this.pageCount - this.imagesRemaining;
      },
      textsProcessed() {
        if (this.pageCount == 0) return 0;
        return this.pageCount - this.textsRemaining;
      },
      imageProgress() {
        if (this.pageCount == 0) return 0;
        return this.imagesProcessed / this.pageCount;
      },
      textProgress() {
        if (this.pageCount == 0) return 0;
        return this.textsProcessed / this.pageCount;
      },
      fresh() {
        return this.success && this.currentProcessingFinished;
      },
      processingProgress() {
        // Empty page count means 0 progress
        if (this.pageCount == 0) return 0;

        const progress =
          (this.imagesProcessed + this.textsProcessed) / (this.pageCount * 2);
        return progress;
      }
    },
  });
}

const POLL_TIMEOUT = 5000;

export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.getMe = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('users/me'));
      return data;
    });

    Vue.API.getAllDocuments = wrapLoad(async function () {
      const nonPendingDocs = await Vue.API.getNonPendingDocuments(null);
      const pendingDocs = await Vue.API.getPendingDocuments(null);
      return pendingDocs.concat(nonPendingDocs);
    });

    Vue.API.getNonPendingDocuments = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('documents/?ordering=-created_at&expand=user,organization'));
      const documents = data.results.filter(doc => doc.status != 'pending' && doc.status != 'nofile');
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getPendingDocuments = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('documents/?ordering=-created_at&status=2&expand=user,organization'));
      const documents = data.results;
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocument = wrapLoad(async function (id) {
      const { data } = await session.get(Vue.API.url(`documents/${id}/?expand=user,organization`));
      return convertDoc(data);
    });

    Vue.API.pollDocument = async function (id, docFn, doneFn) {
      let doc;
      try {
        doc = await Vue.API.getDocument(null, id);
      } catch (e) {
        // Doc was deleted
        return;
      }
      docFn(doc);
      if (doc.nonPending) {
        if (doneFn != null) doneFn(doc);
        return;
      }
      await timeout(POLL_TIMEOUT);
      Vue.API.pollDocument(id, docFn, doneFn);
    };

    Vue.API.deleteDocument = wrapLoad(async function (document) {
      await session.delete(Vue.API.url(`documents/${document.id}/`));
    });

    Vue.API.reprocessDocument = wrapLoad(async function (id) {
      await session.post(Vue.API.url(`documents/${id}/process/`));
    });

    Vue.API.redactDocument = wrapLoad(async function (id, redactions) {
      await session.post(Vue.API.url(`documents/${id}/redactions/`), redactions);
    });

    Vue.API.uploadDocuments = wrapLoad(async function (
      docs,
      progressFn,
      completeFn,
      allCompleteFn,
      errorFn,
    ) {
      // Set initial progresses
      const progresses = [];
      const toComplete = [];
      for (let i = 0; i < docs.length; i++) {
        progresses.push({
          index: i,
          progress: 0,
          startTime: Date.now(),
          completeTime: null,
          interval: null,
        });
        toComplete.push(i);
      }

      for (let i = 0; i < docs.length; i++) {
        const formData = new FormData();
        const file = docs[i].file;
        const name = docs[i].name;
        formData.append('file', file);
        formData.append('title', name);

        session.post(Vue.API.url('documents/'), {
          title: name,
        }).then(response => {
          // Allocate a document with title.
          const responseData = response.data;
          const url = responseData.presigned_url;
          const id = responseData.id;

          axios.put(url, file, {
            headers: {
              'Content-Type': 'application/pdf',
            },
            onUploadProgress: progressEvent => {
              // Handle upload progress
              const progress = progressEvent.loaded / progressEvent.total;
              progresses[i].progress = progress;
              progressFn(i, progress);
            },
          }).then(() => {
            // Upload completed. Post to start processing.
            session.post(Vue.API.url(`documents/${id}/process/`)).then(() => {
              // Handle complete upload
              if (progresses[i].interval != null) {
                // Clear existing fake timer.
                clearTimeout(progresses[i].interval);
                progresses[i].interval = null;
              }
              for (let j = 0; j < toComplete.length; j++) {
                if (toComplete[j] == i) {
                  toComplete.splice(j, 1);
                  completeFn(id, i);
                  break;
                }
              }
              if (toComplete.length == 0) {
                allCompleteFn();
              }
            }, e => {
              errorFn('failed to start processing the document', e);
            });
          }, e => {
            errorFn('failed to upload the document', e);
          });
        }, e => {
          errorFn('failed to create the document', e);
        });
      }
    });

    Vue.API.cancelProcessing = wrapLoad(async function (id) {
      const { data } = await session.delete(Vue.API.url(`documents/${id}/process`));
      return data;
    });
  }
}
