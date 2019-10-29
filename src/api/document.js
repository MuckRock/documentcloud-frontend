import session from './session';
import wrapLoad from './wrapload';
import { timeout } from '../api';
import Vue from 'vue';

const CLOUD_PREFIX = process.env.VUE_APP_STATIC_BASE;

function convertDoc(doc) {
  return new Vue({
    data() {
      return {
        doc,
        loading: false,
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
      thumbnail() {
        // Calculate thumbnail route
        return `${CLOUD_PREFIX}/documents/${this.id}/pages/${this.slug}-p1-normal.gif`;
      },
      title() {
        return this.doc.title;
      },
      pageCount() {
        return this.doc.page_count;
      },
      contributor() {
        return this.doc.contributor; // TODO: get contributor as string
      },
      organization() {
        return this.doc.organization; // TODO: get organization as string
      },
      rawCreatedAt() {
        return this.doc.created_at;
      },
      createdAt() {
        return this.rawCreatedAt; // TODO: parse time format
      },
      status() {
        return this.doc.status;
      },
      imagesRemaining() {
        return this.doc.images_remaining;
      },
      textsRemaining() {
        return this.doc.texts_remaining;
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
      doneProcessing() {
        return this.doc.status != 'pending' || (
          this.imagesRemaining == 0 &&
          this.textsRemaining == 0
        )
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

const POLL_TIMEOUT = 1200;

export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.getMe = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('users/me'));
      return data;
    });

    Vue.API.getDocuments = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('documents/?expand=user,organization'));
      const documents = data.results;
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocument = wrapLoad(async function (id) {
      const { data } = await session.get(Vue.API.url(`documents/${id}/?expand=user,organization`));
      return convertDoc(data);
    });

    Vue.API.pollDocument = async function (id, docFn, doneFn) {
      const doc = await Vue.API.getDocument(null, id);
      docFn(doc);
      if (doc.doneProcessing) {
        doneFn(doc);
        return;
      }
      await timeout(POLL_TIMEOUT);
      Vue.API.pollDocument(id, docFn, doneFn);
    };

    Vue.API.deleteDocument = wrapLoad(async function (document) {
      await session.delete(Vue.API.url(`documents/${document.id}/`));
    });

    Vue.API.uploadDocuments = wrapLoad(async function (
      docs,
      progressFn,
      completeFn,
      allCompleteFn
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
        formData.append('progress_updates', 'true');

        session
          .post(Vue.API.url('documents/'), formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: progressEvent => {
              // Handle upload progress
              const progress = progressEvent.loaded / progressEvent.total;
              progresses[i].progress = progress;
              progressFn(i, progress);
            },
          })
          .then(response => {
            // Handle complete upload
            if (progresses[i].interval != null) {
              // Clear existing fake timer.
              clearTimeout(progresses[i].interval);
              progresses[i].interval = null;
            }
            for (let j = 0; j < toComplete.length; j++) {
              if (toComplete[j] == i) {
                toComplete.splice(j, 1);
                completeFn(convertDoc(response.data), i);
                break;
              }
            }
            if (toComplete.length == 0) {
              allCompleteFn();
            }
          });
      }
    });
  },
};
