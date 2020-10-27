class Modifications {
  constructor() {
    this.adds = [];
    this.modifies = [];
    this.removes = [];
  }

  add(modifiers, documents) {
    this.adds.push([modifiers, documents]);
  }

  modify(modifiers, document, fn) {
    this.modifies.push([modifiers, document, fn]);
  }

  remove(modifiers, document) {
    this.removes.push([modifiers, document.id]);
  }

  applyModifications() {
    // Add documents in (according to filter)
    this.adds.forEach(([modifiers, adds]) => {
      // Add documents in that were added and not modified
      const unmodified = adds.filter(doc => {
        return this.modifies.filter(modifier => modifier[1].id == doc.id).length == 0
      });
      modifiers.addToCollection(unmodified, false);
    });

    // Modify documents
    this.modifies.forEach(([modifiers, document, fn]) => {
      // If the document matches the filter, update it
      const [modified, newDoc] = modifiers.updateInCollection(document, fn, false);
      if (!modified) {
        // If the document wasn't updated, it doesn't exist. Create it
        modifiers.addToCollection([newDoc], false);
      }
    });

    // Remove documents
    this.removes.forEach(([modifiers, doc]) => {
      // Remove documents that have been removed (no exceptions)
      modifiers.removeFromCollection(doc, false);
    });
  }
}

export let modifications = new Modifications();
