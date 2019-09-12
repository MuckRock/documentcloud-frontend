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
      this.progresses.push({index: i, progress: 0});
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

export class ProcessingRequest {
  constructor(docId) {
    this.docId = docId;

    this.pageCount = null;
    this.thumbnail = null;
    this.imagesProcessed = 0;
    this.textsProcessed = 0;

    setTimeout(() => this.sendPageCount(), 500);
  }

  async requestProgress(doc) {
    if (doc.processing == null) return;
    await timeout(200);
    if (this.pageCount > 0) {
      doc.pageCount = this.pageCount;
      doc.processing.imagesProcessed = this.imagesProcessed;
      doc.processing.textsProcessed = this.textsProcessed;
      doc.processing.progress =
        (this.imagesProcessed + this.textsProcessed) / (this.pageCount * 2);
      if (
        this.imagesProcessed >= this.pageCount &&
        this.textsProcessed >= this.pageCount
      ) {
        doc.processing.done = true;
      }
    } else {
      doc.processing.progress = 0;
    }
    if (this.thumbnail != null) {
      doc.thumbnail = this.thumbnail;
    }
  }

  // Continually update doc until done
  async progressLoop(doc) {
    await this.requestProgress(doc);
    if (doc.processing.done) return;
    setTimeout(() => this.progressLoop(doc), 500);
  }

  sendProgressUpdate() {
    setTimeout(() => {
      if (Math.random() < 0.7) {
        this.sendImageUpdate();
      } else {
        this.sendTextUpdate();
      }
    }, Math.random() * 700 + 300);
  }

  sendTextUpdate() {
    if (this.textsProcessed < this.pageCount) {
      this.textsProcessed++;
    }
    this.sendProgressUpdate();
  }

  sendImageUpdate() {
    if (this.imagesProcessed < this.pageCount) {
      this.imagesProcessed++;
    }
    this.sendProgressUpdate();
  }

  sendPageCount() {
    this.pageCount = Math.floor(Math.random() * 20 + 1);

    setTimeout(() => this.sendThumbnail(), 500);
  }

  sendThumbnail() {
    this.thumbnail =
      'https://www.documentcloud.org/documents/5973280/pages/doc4-p1-normal.gif';
    this.sendProgressUpdate();
  }
}
