import { documents, updateInCollection, removeFromCollection } from './documents';
import { makeDocument } from '@/structure/documentFactory';
import { setDocuments, search } from '@/search/search';
import { addToArrayIfUnique, removeFromArray } from '@/util/array';
import { modifications } from './modifications';

beforeEach(() => {
  modifications.clearModifications();
});

function expectDocsEqual(docs1, docs2) {
  expect(docs1.map(d => d.doc)).toEqual(docs2.map(d => d.doc));
}

function addToProject(doc, projectId) {
  doc.doc = { ...doc.doc, projects: addToArrayIfUnique(doc.projectIds, projectId) };
}

function removeFromProject(doc, projectId) {
  doc.doc = { ...doc.doc, projects: removeFromArray(doc.projectIds, projectId) }
}

function updatePending() {
  documents.pending = documents.processingDocuments;
}

function mockSearch([fn, filter]) {
  const results = fn();
  setDocuments(results);
  if (filter != null) {
    modifications.applyModifications();
    setDocuments(documents.allDocuments.filter(filter));
  } else {
    // Force update
    search.results = search.results;
  }
}

test("init mock document", async () => {
  const doc = makeDocument();
  setDocuments([doc]);
  expectDocsEqual(documents.allDocuments, [doc]);
});

test("project cache add", async () => {
  // Create a document not in any project
  const doc = makeDocument();

  const project = 1;

  // Search methods
  const yourDocuments = [() => [doc], null];
  const projDocuments = [() => [], d => d.projectIds.includes(project)];

  // Expect 1 document in your documents
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document not to be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, []);

  // Go back to your documents and add the doc to your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => addToProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
});

test("project cache remove", async () => {
  // Create a document in a project
  const project = 1;
  const doc = makeDocument({ projects: [project] });

  // Search methods
  const yourDocuments = [() => [doc], null];
  const projDocuments = [() => [doc], d => d.projectIds.includes(project)];

  // Expect the document in your documents
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Go back to your documents and remove the doc from your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => removeFromProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now not be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, []);
});

test("project cache remove and add", async () => {
  // Create a document in a project
  const project = 1;
  const doc = makeDocument({ projects: [project] });

  // Search methods
  const yourDocuments = [() => [doc], null];
  const projDocuments = [() => [doc], d => d.projectIds.includes(project)];

  // Expect the document in your documents
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Go back to your documents and remove the doc from your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => removeFromProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now not be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, []);

  // Go back to your documents and add the doc to your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => addToProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
});

test("project cache add and remove", async () => {
  // Create a document not in any project
  const doc = makeDocument();

  const project = 1;

  // Search methods
  const yourDocuments = [() => [doc], null];
  const projDocuments = [() => [], d => d.projectIds.includes(project)];

  // Expect 1 document in your documents
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document not to be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, []);

  // Go back to your documents and add the doc to your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => addToProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now be in your project
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);

  // Go back to your documents and remove the doc from your project
  mockSearch(yourDocuments);
  expectDocsEqual(documents.allDocuments, [doc]);
  updateInCollection(doc, d => removeFromProject(d, project));
  expectDocsEqual(documents.allDocuments, [doc]);

  // Expect the document to now be out of your project again
  mockSearch(projDocuments);
  expectDocsEqual(documents.allDocuments, []);
});

test("stale delete processing doc", async () => {
  const doc = makeDocument();
  setDocuments([doc]);
  expect(documents.numProcessing).toBe(0);
  // Make doc go into reprocessing state
  updateInCollection(doc, d => d.doc = { ...d.doc, status: 'pending' });
  updatePending();
  // Expect doc to be processing
  expect(documents.numProcessing).toBe(1);
  // Remove the doc while it's processing
  removeFromCollection(doc.id);
  updatePending();
  // Should be no docs processing now
  expect(documents.numProcessing).toBe(0);

  // Apply modifications to simulate loading back into the view
  modifications.applyModifications();
  // The document should still be deleted
  expect(documents.numProcessing).toBe(0);
});
