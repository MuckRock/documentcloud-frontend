import { Svue } from "svue";
import {
  runify,
  Empty,
  Individual,
  ModificationSpec,
  CLOCKWISE,
} from "./modifySpec.js";

class Modification extends Svue {
  constructor() {
    super({
      data() {
        return {
          copyBuffer: null,
          modifySelectedMap: {},
          rewind: false,
          insert: null,
          history: [],
          historyPosition: 0,
          insertDocument: null,
          documentCache: {},
        };
      },
      computed: {
        historyLength(history) {
          return history.length;
        },
        modifySpec(history, historyLength, historyPosition) {
          if (historyLength == 0) return null;
          return history[historyPosition];
        },
        pageCount(modifySpec) {
          if (modifySpec == null) return 0;
          return modifySpec.length();
        },
        modifySelected(modifySelectedMap) {
          const results = [];
          for (let key in modifySelectedMap) {
            if (
              modifySelectedMap.hasOwnProperty(key) &&
              modifySelectedMap[key] == true
            ) {
              results.push(key);
            }
          }
          return results;
        },
        modifyNumSelected(modifySelected) {
          return modifySelected.length;
        },
        modifyHasSelection(modifyNumSelected) {
          const hasSelection = modifyNumSelected > 0;
          if (hasSelection) {
            this.clearInsertion();
          }
          return hasSelection;
        },
        modifySelectedPageSpec(modifySelected) {
          return runify(modifySelected);
        },
        modifySelectedSpec(modifySpec, modifySelectedPageSpec) {
          if (modifySpec == null) return null;
          const selectedSpec = new ModificationSpec(
            modifySelectedPageSpec.specs.reduce((prev, spec) => {
              if (spec instanceof Empty) return prev;
              if (spec instanceof Individual)
                return prev.concat(modifySpec.slice(spec.pg, 1).specs);
              return prev.concat(
                modifySpec.slice(spec.start, spec.length()).specs,
              );
            }, []),
          ).compress();
          return selectedSpec;
        },
        hasInsert(insert) {
          return insert != null;
        },
        hasCopyBuffer(copyBuffer) {
          return copyBuffer != null;
        },
        copyBufferLength(copyBuffer) {
          if (copyBuffer == null) return 0;
          return copyBuffer.length();
        },
        canUndo(historyPosition) {
          return historyPosition > 0;
        },
        canRedo(historyLength, historyPosition) {
          return historyPosition + 1 < historyLength;
        },
        hasHistory(historyLength) {
          return historyLength > 1;
        },
        uncommittedChanges(historyPosition) {
          return historyPosition > 0;
        },
      },
    });
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

export const modification = new Modification();
