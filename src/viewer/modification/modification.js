import { Svue } from 'svue';
import { runify, Empty, Individual, ModificationSpec, CLOCKWISE } from './modifySpec';

class Modification extends Svue {
  constructor() {
    super({
      data() {
        return {
          modifySpec: null,
          copyBuffer: null,
          modifySelectedMap: {},
          rewindSpec: null,
          insert: null,
        }
      },
      computed: {
        pageCount(modifySpec) {
          if (modifySpec == null) return 0;
          return modifySpec.length();
        },
        modifySelected(modifySelectedMap) {
          const results = [];
          for (let key in modifySelectedMap) {
            if (modifySelectedMap.hasOwnProperty(key) && modifySelectedMap[key] == true) {
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
          const selectedSpec = new ModificationSpec(modifySelectedPageSpec.specs.reduce((prev, spec) => {
            if (spec instanceof Empty) return prev;
            if (spec instanceof Individual) return prev.concat(modifySpec.slice(spec.pg, 1).specs);
            return prev.concat(modifySpec.slice(spec.start, spec.length()).specs);
          }, [])).compress();
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
        }
      }
    })
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
    if (!this.modifyHasSelection || this.modifyNumSelected == this.pageCount) return;
    this.modifySpec = this.modifySpec.remove(this.modifySelectedPageSpec);
    this.modifyUnselect();
  }

  cut() {
    if (!this.modifyHasSelection || this.modifyNumSelected == this.pageCount) return;
    this.rewindSpec = this.modifySpec;
    this.copyBuffer = this.modifySelectedSpec;
    this.remove();
  }

  rotateClockwise() {
    if (this.modifySpec == null || this.modifySelectedPageSpec == null) return;
    this.modifySpec = this.modifySpec.applyModification(x => x.rotate(CLOCKWISE), this.modifySelectedPageSpec);
  }

  clearCopyBuffer() {
    if (this.rewindSpec != null) {
      this.modifySpec = this.rewindSpec;
      this.rewindSpec = null;
    }
    this.copyBuffer = null;
    this.clearInsertion();
  }

  clearInsertion() {
    this.insert = null;
  }

  selectInsert(i) {
    if (this.insert == i) {
      this.clearInsertion();
    } else {
      this.insert = i;
    }
  }

  pasteAtEnd() {
    if (this.modifySpec == null || this.copyBuffer == null) {
      this.clearCopyBuffer();
      return;
    }
    this.modifySpec = this.modifySpec.concat(this.copyBuffer);
    this.rewindSpec = null;
    this.clearCopyBuffer();
  }

  pasteAtInsert() {
    if (this.modifySpec == null || this.copyBuffer == null || this.insert == null) {
      this.clearCopyBuffer();
      return;
    }
    this.modifySpec = this.modifySpec.slice(0, this.insert).concat(this.copyBuffer).concat(this.modifySpec.slice(this.insert, this.pageCount));
    this.rewindSpec = null;
    this.clearCopyBuffer();
  }

  clear() {
    this.modifyUnselect();
    this.clearCopyBuffer();
    this.modifySpec = null;
  }
}

export const modification = new Modification();
