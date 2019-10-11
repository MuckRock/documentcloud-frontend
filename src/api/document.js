import session from './session';
import wrapLoad from './wrapload';
import { timeout } from '../api';

let processingStarts = {};

const MAX_PROCESSING_PROGRESS = 0.5;

function calculateProcessingProgress(doc) {
  const pageCount = doc.pages;
  if (pageCount == 0) return 0;
  let imagesRemaining = doc.images_remaining;
  let textsRemaining = doc.texts_remaining;
  if (imagesRemaining == null || textsRemaining == null) return 0;

  if (imagesRemaining < 0) imagesRemaining = 0;
  if (textsRemaining < 0) textsRemaining = 0;

  const strictProgress =
    (pageCount - imagesRemaining + (pageCount - textsRemaining)) / 2 / pageCount;
  const timeElapsed = (Date.now() - processingStarts[doc.id]) / 1000;
  const timeProgress = timeElapsed / (timeElapsed + 1);
  const progress =
    strictProgress * MAX_PROCESSING_PROGRESS +
    timeProgress * (1 - MAX_PROCESSING_PROGRESS);

  return progress;
}

function convertDoc(doc) {
  if (processingStarts[doc.id] == null) {
    processingStarts[doc.id] = Date.now();
  }
  return {
    id: doc.id,
    title: doc.title,
    pageCount: doc.pages,
    thumbnail: doc.resources.thumbnail.replace('-thumbnail.gif', '-normal.gif'),
    contributor: doc.contributor,
    organization: 'DocumentCloud',
    createdAt: doc.created_at
      .split(' ')
      .slice(1, 4)
      .join(' '),
    processing: {
      done: doc.access != 'pending',
      loading: false,
      imagesRemaining: doc.images_remaining,
      textsRemaining: doc.texts_remaining,
      progress: calculateProcessingProgress(doc),
    },
  };
}

const PROGRESS_COMPLETE = 0.5;

const POLL_TIMEOUT = 4000;

export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.getMe = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.apiUrl + 'users/me');
      window.console.log('user profile', data);
      // return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocuments = wrapLoad(async function () {
      const { data } = await session.get(Vue.API.apiUrl + 'documents/');
      const documents = data.results;
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocument = wrapLoad(async function (id) {
      const { data } = await session.get(`/api/documents/${id}`);
      return convertDoc(data.document);
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
      await session.delete(`/api/documents/${document.id}/`);
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
          .post('/api/upload/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: progressEvent => {
              // Handle upload progress
              if (progressEvent.loaded == progressEvent.total) {
                // Fully loaded. Simulate extra time delay for now.
                if (progresses[i].completeTime == null) {
                  progresses[i].completeTime = Date.now();
                }
                if (progresses[i].interval == null) {
                  progresses[i].interval = setInterval(() => {
                    const timeElapsedSinceCompletion =
                      (Date.now() - progresses[i].completeTime) / 1000;
                    // let newProgress =
                    //   timeElapsedSinceCompletion /
                    //   (progresses[i].completeTime -
                    //     progresses[i].startTime +
                    //     STATIC_PROGRESS_DELAY);
                    let newProgress =
                      timeElapsedSinceCompletion / (timeElapsedSinceCompletion + 1);
                    newProgress =
                      PROGRESS_COMPLETE + newProgress * (1 - PROGRESS_COMPLETE);
                    if (newProgress > 1) newProgress = 1;
                    progresses[i].progress = newProgress;
                    progressFn(i, newProgress);
                  }, 50);
                }
                return;
              }
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
