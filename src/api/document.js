import session from './session';
import wrapLoad from './wrapload';
import {timeout} from '../api';

function calculateProcessingProgress(doc) {
  const pageCount = doc.pages;
  if (pageCount == 0) return 0;
  let imagesRemaining = doc.images_remaining;
  let textsRemaining = doc.texts_remaining;
  if (imagesRemaining == null || textsRemaining == null) return 0;

  if (imagesRemaining < 0) imagesRemaining = 0;
  if (textsRemaining < 0) textsRemaining = 0;
  return (pageCount - imagesRemaining + (pageCount - textsRemaining)) / 2 / pageCount;
}

function convertDoc(doc) {
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
      progress: calculateProcessingProgress(doc),
    },
  };
}

const PROGRESS_COMPLETE = 0.99;

const POLL_TIMEOUT = 4000;

export default {
  install(Vue) {
    if (Vue.API == null) Vue.API = {};

    Vue.API.getDocuments = wrapLoad(async function() {
      const {data} = await session.get('/api/search/');
      const documents = data.documents;
      window.console.log(documents[0]);
      return documents.map(doc => convertDoc(doc));
    });

    Vue.API.getDocument = wrapLoad(async function(id) {
      const {data} = await session.get(`/api/documents/${id}`);
      return convertDoc(data.document);
    });

    Vue.API.pollDocument = async function(id, docFn, doneFn) {
      const doc = await Vue.API.getDocument(null, id);
      window.console.log('polled', doc);
      docFn(doc);
      if (doc.processing.done) {
        doneFn(doc);
        return;
      }
      await timeout(POLL_TIMEOUT);
      Vue.API.pollDocument(id, docFn, doneFn);
    };

    Vue.API.deleteDocument = wrapLoad(async function(document) {
      await session.delete(`/api/documents/${document.id}/`);
    });

    Vue.API.uploadDocuments = wrapLoad(async function(
      docs,
      progressFn,
      completeFn,
      allCompleteFn
    ) {
      // Set initial progresses
      const progresses = [];
      const toComplete = [];
      for (let i = 0; i < docs.length; i++) {
        progresses.push({index: i, progress: 0});
        toComplete.push(i);
      }

      for (let i = 0; i < docs.length; i++) {
        const formData = new FormData();
        const file = docs[i].file;
        const name = docs[i].name;
        window.console.log(file, name);
        formData.append('file', file);
        formData.append('title', name);
        formData.append('progress_updates', 'true');

        window.console.log(document.cookie);
        window.debugger;
        session
          .post('/api/upload/', formData, {
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
            window.console.log(response.data);
            // Handle complete upload
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
