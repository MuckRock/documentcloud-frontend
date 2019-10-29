// Implements a "server" that responds to things.

export const UPLOAD_ROUTE = '/api/upload';

export const SEARCH_ROUTE = '/api/search';

import data from './data.js';

export function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getDocsAndProjects() {
  await timeout(300);
  return data;
}

let docId = 53462;

export class UploadRequest {
  constructor(docs, progress, complete, allComplete) {
    this.docs = docs;
    this.progressHandler = progress;
    this.completeHandler = complete;
    this.allCompleteHandler = allComplete;

    // Set initial progresses
    this.progresses = [];
    for (let i = 0; i < this.docs.length; i++) {
      this.progresses.push({ index: i, progress: 0 });
    }
  }

  _updateProgress() {
    for (
      let k = 0;
      k < Math.random() * this.docs.length + this.docs.length / 2 + 1;
      k++
    ) {
      // Update random progresses
      this.progresses[Math.floor(Math.random() * this.progresses.length)].progress +=
        Math.random() * 0.003;
    }

    // Check on complete progresses
    const toRemove = [];
    for (let i = 0; i < this.progresses.length; i++) {
      const progress = this.progresses[i];
      if (progress.progress >= 1) {
        toRemove.push(i);
      } else {
        this.progressHandler(progress.index, progress.progress);
      }
    }

    // Remove complete progresses and call complete handler
    while (toRemove.length > 0) {
      const progress = this.progresses.splice(toRemove.pop(), 1)[0];
      this.completeHandler(progress.index, docId);
      docId++;
    }

    // Check for all complete
    if (this.progresses.length == 0) {
      this.allCompleteHandler();
      return;
    }

    setTimeout(() => this._updateProgress(), 10);
  }

  upload() {
    setTimeout(() => this._updateProgress(), 100);
  }
}
