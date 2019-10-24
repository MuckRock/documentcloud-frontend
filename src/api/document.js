import session from './session';
import wrapLoad from './wrapload';
import { timeout } from '../api';

let processingStarts = {};

function calculateProcessingProgress(doc) {
  const pageCount = doc.page_count;
  if (pageCount == 0) return 0;
  let imagesRemaining = doc.images_remaining;
  let textsRemaining = doc.texts_remaining;
  if (imagesRemaining == null || textsRemaining == null) return 0;

  if (imagesRemaining < 0) imagesRemaining = 0;
  if (textsRemaining < 0) textsRemaining = 0;

  const progress =
    (pageCount - imagesRemaining + (pageCount - textsRemaining)) / 2 / pageCount;

  return progress;
}

function convertDoc(doc) {
  window.console.log(doc);
  if (processingStarts[doc.id] == null) {
    processingStarts[doc.id] = Date.now();
  }
  return {
    id: doc.id,
    slug: doc.slug,
    slugId: [doc.id, doc.slug].join('-'),
    title: doc.title,
    pageCount: doc.page_count,
    thumbnail: null, // TODO: Get thumbnail (doc.resources && doc.resources.thumbnail && doc.resources.thumbnail.replace('-thumbnail.gif', '-normal.gif'),)
    contributor: '', // TODO: get contributor (doc.contributor,)
    organization: '', // TODO: get organization ('DocumentCloud'),
    createdAt: doc.created_at, // TODO: parse time format
    processing: {
      done: doc.status != 'pending' || (
        doc.images_remaining == 0 &&
        doc.texts_remaining == 0
      ),
      loading: false,
      imagesRemaining: doc.images_remaining,
      textsRemaining: doc.texts_remaining,
      totalPages: doc.page_count,
      progress: calculateProcessingProgress(doc),
    },
  };
}

const PROGRESS_COMPLETE = 0.5;

const POLL_TIMEOUT = 1200;

export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.getMe = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('users/me'));
      window.console.log('user profile', data);
      // return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocuments = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.url('documents/'));
      const documents = data.results;
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocument = wrapLoad(async function (id) {
      const { data } = await session.get(Vue.API.url(`documents/${id}/`));
      return convertDoc(data);
    });

    Vue.API.pollDocument = async function (id, docFn, doneFn) {
      const doc = await Vue.API.getDocument(null, id);
      docFn(doc);
      if (doc.processing.done) {
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
              const progress =
                (progressEvent.loaded / progressEvent.total) * PROGRESS_COMPLETE;
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
