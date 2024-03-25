import { Writable, writable } from "svelte/store";
import {
  runify,
  Empty,
  Individual,
  ModificationSpec,
  CLOCKWISE,
} from "./modifySpec";

// TODO replace with typed and de-Svue'd `structure/Document`
interface Document {
  pageCount: number;
  id: string;
}

export class Modification {
  copyBuffer: ModificationSpec | null;
  modifySelectedMap: Record<string, unknown>;
  rewind: boolean;
  insert: null;
  history: ModificationSpec[];
  historyPosition: number;
  insertDocument: Document | null;
  documentCache: Record<string, unknown>;

  constructor() {
    this.copyBuffer = null;
    this.modifySelectedMap = {};
    this.rewind = false;
    this.insert = null;
    this.history = [];
    this.historyPosition = 0;
    this.insertDocument = null;
    this.documentCache = null;
  }

  get historyLength() {
    return this.history.length;
  }

  get modifySpec() {
    if (this.historyLength === 0) return null;
    return this.history[this.historyPosition];
  }

  get pageCount() {
    if (this.modifySpec === null) return 0;
    return this.modifySpec.length();
  }

  get modifySelected() {
    const results = [];
    for (let key in this.modifySelectedMap) {
      if (
        this.modifySelectedMap.hasOwnProperty(key) &&
        this.modifySelectedMap[key] == true
      ) {
        results.push(key);
      }
    }
    return results;
  }

  get modifyNumSelected() {
    return this.modifySelected.length;
  }

  get modifyHasSelection() {
    const hasSelection = this.modifyNumSelected > 0;
    if (hasSelection) {
      this.clearInsertion();
    }
    return hasSelection;
  }

  get modifySelectedPageSpec() {
    return runify(this.modifySelected);
  }

  get modifySelectedSpec() {
    if (this.modifySpec == null) return null;
    const selectedSpec = new ModificationSpec(
      this.modifySelectedPageSpec.specs.reduce((prev, spec) => {
        if (spec instanceof Empty) return prev;
        if (spec instanceof Individual)
          return prev.concat(this.modifySpec.slice(spec.pg, 1).specs);
        return prev.concat(
          this.modifySpec.slice(spec.start, spec.length()).specs,
        );
      }, []),
    ).compress();
    return selectedSpec;
  }

  get hasInsert() {
    return this.insert != null;
  }

  get hasCopyBuffer() {
    return this.copyBuffer != null;
  }

  get copyBufferLength() {
    if (this.copyBuffer === null) return 0;
    return this.copyBuffer.length();
  }

  get canUndo() {
    return this.historyPosition > 0;
  }

  get canRedo() {
    return this.historyPosition + 1 < this.historyLength;
  }

  get hasHistory() {
    return this.historyLength > 1;
  }

  get uncommittedChanges() {
    return this.historyPosition > 0;
  }

  modifyUnselect() {
    this.modifySelectedMap = {};
  }

  select(pages) {
    for (let i = 0; i < pages.length; i++) {
      this.modifySelectedMap[pages[i]] = true;
    }
    this.modifySelectedMap = this.modifySelectedMap;
  }

  copy() {
    if (!this.modifyHasSelection) return;
    this.copyBuffer = this.modifySelectedSpec;
    this.modifyUnselect();
  }

  remove() {
    if (!this.modifyHasSelection || this.modifyNumSelected == this.pageCount)
      return;
    this.modify(this.modifySpec.remove(this.modifySelectedPageSpec));
    this.modifyUnselect();
  }

  cut() {
    if (!this.modifyHasSelection || this.modifyNumSelected == this.pageCount)
      return;
    this.rewind = true;
    this.copyBuffer = this.modifySelectedSpec;
    this.remove();
  }

  rotateClockwise() {
    if (this.modifySpec == null || this.modifySelectedPageSpec == null) return;
    this.modify(
      this.modifySpec.applyModification(
        (x) => x.rotate(CLOCKWISE),
        this.modifySelectedPageSpec,
      ),
    );
  }

  clearCopyBuffer() {
    if (this.rewind) {
      this.undo();
      this.history = this.history.slice(0, this.history.length - 1);
      this.rewind = false;
    }
    this.copyBuffer = null;
    this.clearInsertion();
  }

  clearInsertion() {
    this.insert = null;
    this.insertDocument = null;
  }

  selectInsert(i) {
    if (this.insert == i) {
      this.clearInsertion();
    } else {
      this.insert = i;
    }
  }

  modifyTempOperation(modifySpec) {
    if (this.rewind) {
      this.undo();
      this.history.pop();
      this.rewind = false;
    }
    this.modify(modifySpec);
  }

  pasteAtEnd() {
    if (this.modifySpec == null || this.copyBuffer == null) {
      this.clearCopyBuffer();
      return;
    }
    this.modifyTempOperation(this.modifySpec.concat(this.copyBuffer));
    this.clearCopyBuffer();
  }

  pasteAtInsert() {
    if (
      this.modifySpec == null ||
      this.copyBuffer == null ||
      this.insert == null
    ) {
      this.clearCopyBuffer();
      return;
    }
    this.modifyTempOperation(
      this.modifySpec
        .slice(0, this.insert)
        .concat(this.copyBuffer)
        .concat(this.modifySpec.slice(this.insert, this.pageCount)),
    );
    this.clearCopyBuffer();
  }

  clear() {
    this.modifyUnselect();
    this.clearCopyBuffer();
    this.insertDocument = null;
    this.historyPosition = 0;
    this.history = [];
  }

  initSpec(modifySpec) {
    this.history = [modifySpec];
    this.historyPosition = 0;
  }

  insertDocumentAtPosition() {
    if (this.insertDocument != null) {
      // Create a document spec for the insertion document
      const docSpec = ModificationSpec.getDocument(
        this.insertDocument.pageCount,
        this.insertDocument.id,
      );
      this.modify(
        this.modifySpec
          .slice(0, this.insert)
          .concat(docSpec)
          .concat(this.modifySpec.slice(this.insert, this.pageCount)),
      );
      this.clearInsertion();
    }
  }

  undo() {
    if (this.canUndo) {
      this.historyPosition--;
    }
  }

  redo() {
    if (this.canRedo) {
      this.historyPosition++;
    }
  }

  modify(newModifySpec) {
    const history = this.history.slice(0, this.historyPosition + 1);
    history.push(newModifySpec);
    this.history = history;
    this.historyPosition++;
  }
}

export const modification: Writable<Modification> = writable(
  new Modification(),
);
