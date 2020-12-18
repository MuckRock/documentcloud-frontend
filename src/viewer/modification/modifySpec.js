import { arrayEq } from '@/util/array';

export class Empty {
  constructor() { }

  toNumbers() {
    return [];
  }

  spec() {
    return '';
  }

  index(_) { return null }

  length() { return 0; }

  slice(_a, _b) { return new Empty(); }
}

export class Range {
  constructor(startInclusive, endInclusive) {
    this.start = startInclusive;
    this.end = endInclusive;
  }

  toNumbers() {
    const results = [];
    for (let i = this.start; i <= this.end; i++) {
      results.push(i);
    }
    return results;
  }

  spec() {
    return `${this.start}-${this.end}`;
  }

  index(i) {
    return this.start + i;
  }

  length() {
    return this.end - this.start + 1;
  }

  slice(i, l) {
    const start = this.start + i;
    const end = this.start + i + l - 1;
    if (start == end) return new Individual(start);
    if (start > end) return new Empty();
    return new Range(start, end);
  }
}

export class Individual {
  constructor(pg) {
    this.pg = pg;
  }

  toNumbers() {
    return [this.pg];
  }

  spec() {
    return `${this.pg}`;
  }

  index(_) {
    return this.pg;
  }

  length() {
    return 1;
  }

  slice(i, l) {
    if (i != 0 || l < 1) {
      return new Empty();
    }
    return new Individual(this.pg);
  }
}

export class PageSpec {
  constructor(specs) {
    this.specs = specs;
  }

  static parse(spec) {
    if (spec.length == 0) return new PageSpec([]);
    const specs = spec.split(',');
    return new PageSpec(specs.map(x => {
      const parts = x.split('-');
      if (parts.length > 1) {
        return new Range(parseInt(parts[0]), parseInt(parts[1]));
      } else {
        return new Individual(parseInt(parts[0]));
      }
    }));
  }

  toNumbers() {
    const numbers = [];
    for (let i = 0; i < this.specs.length; i++) {
      const pgs = this.specs[i].toNumbers();
      for (let j = 0; j < pgs.length; j++) {
        numbers.push(pgs[j]);
      }
    }
    return numbers;
  }

  spec() {
    return this.specs.map(x => x.spec()).join(',');
  }

  index(i) {
    for (let j = 0; j < this.specs.length; j++) {
      const spec = this.specs[j];
      const l = spec.length();
      if (i < l) return spec.index(i);
      i -= l;
    }
    return null;
  }

  length() {
    let sum = 0;
    for (let i = 0; i < this.specs.length; i++) {
      sum += this.specs[i].length();
    }
    return sum;
  }

  slice(i, length) {
    const newSpecs = [];
    for (let j = 0; j < this.specs.length; j++) {
      const spec = this.specs[j];
      const l = spec.length();
      if (i < l) {
        const newLength = Math.min(l - i, length);
        newSpecs.push(spec.slice(i, newLength));
        length -= newLength;
        if (length == 0) break;
      }
      i = Math.max(i - l, 0);
    }
    return new PageSpec(newSpecs).compress();
  }

  compress() {
    let currentRun = [];
    const newSpecs = [];

    const flushRun = () => {
      if (currentRun.length == 0) return;
      if (currentRun.length == 1) {
        newSpecs.push(new Individual(currentRun[0]));
      } else {
        newSpecs.push(new Range(currentRun[0], currentRun[1]));
      }
    };

    const startRun = (spec) => {
      if (spec instanceof Individual) {
        currentRun = [spec.pg];
      } else {
        currentRun = [spec.start, spec.end];
      }
    }

    for (let i = 0; i < this.specs.length; i++) {
      const spec = this.specs[i];
      if (spec instanceof Empty) continue;

      if (currentRun.length == 0) {
        startRun(spec);
      } else {
        const start = (spec instanceof Individual) ? spec.pg : spec.start;
        const end = (spec instanceof Individual) ? spec.pg : spec.end;
        if (start == currentRun[currentRun.length - 1] + 1) {
          if (currentRun.length == 1) {
            currentRun.push(end)
          } else {
            currentRun[1] = end;
          }
        } else {
          flushRun();
          startRun(spec);
        }
      }
    }
    flushRun();
    return new PageSpec(newSpecs);
  }

  concat(other) {
    return new PageSpec(this.specs.concat(other.specs)).compress();
  }

  remove(other) {
    // Remove from indices specified by other spec
    let page = 0;
    let newSpecs = [];
    const pushUpTo = pg => {
      if (pg > page) {
        newSpecs = newSpecs.concat(this.slice(page, pg - page).specs);
      }
    };

    for (let i = 0; i < other.specs.length; i++) {
      const spec = other.specs[i];
      if (spec instanceof Empty) continue;
      if (spec instanceof Individual) {
        pushUpTo(spec.pg);
        page = spec.pg + 1;
      }
      if (spec instanceof Range) {
        pushUpTo(spec.start);
        page = spec.end + 1;
      }
    }
    pushUpTo(this.length());

    return new PageSpec(newSpecs).compress();
  }
}

export function runify(pageNumbers) {
  let currentRun = [];
  const specs = [];

  const flushRun = () => {
    if (currentRun.length == 0) return;
    if (currentRun.length == 1) {
      specs.push(new Individual(currentRun[0]));
    } else {
      specs.push(new Range(currentRun[0], currentRun[1]));
    }
  };

  for (let i = 0; i < pageNumbers.length; i++) {
    const pg = parseInt(pageNumbers[i]);
    if (currentRun.length == 0) {
      currentRun.push(pg);
    } else {
      if (pg == currentRun[currentRun.length - 1] + 1) {
        if (currentRun.length == 1) {
          currentRun.push(pg)
        } else {
          currentRun[1] = pg;
        }
      } else {
        flushRun();
        currentRun = [pg];
      }
    }
  }
  flushRun();
  return new PageSpec(specs);
}

export const CLOCKWISE = 'cc';
export const COUNTER_CLOCKWISE = 'ccw';
export const HALFWAY = 'hw';
const ROTATION_MATRIX = {
  [CLOCKWISE]: {
    [CLOCKWISE]: HALFWAY,
    [COUNTER_CLOCKWISE]: null,
    [HALFWAY]: COUNTER_CLOCKWISE
  },
  [COUNTER_CLOCKWISE]: {
    [CLOCKWISE]: null,
    [COUNTER_CLOCKWISE]: HALFWAY,
    [HALFWAY]: CLOCKWISE
  },
  [HALFWAY]: {
    [CLOCKWISE]: COUNTER_CLOCKWISE,
    [COUNTER_CLOCKWISE]: CLOCKWISE,
    [HALFWAY]: null
  },
};
export const ROTATE = 'rotate';
export class Rotation {
  constructor(angle) {
    this.type = ROTATE;
    this.angle = angle;
  }

  json() {
    return {
      type: this.type,
      angle: this.angle
    }
  }

  eq(other) {
    return other.type == ROTATE && other.angle == this.angle;
  }
}

export class ModificationDescriptor {
  constructor(pageSpec, modifications = [], id = null) {
    this.pageSpec = pageSpec;
    this.modifications = modifications;
    this.id = id;
  }

  toDescriptors() {
    const results = [];
    for (let i = 0; i < this.length(); i++) {
      results.push(this.slice(i, 1));
    }
    return results;
  }

  toTransform() {
    const transforms = this.modifications.map(x => {
      if (x.type == ROTATE) {
        if (x.angle == CLOCKWISE) return 'rotate(90deg)';
        if (x.angle == HALFWAY) return 'rotate(180deg)';
        if (x.angle == COUNTER_CLOCKWISE) return 'rotate(270deg)';
      }
      return '';
    });
    return transforms.join(' ');
  }

  toNumbers() {
    return this.pageSpec.toNumbers();
  }

  json() {
    const json = {};
    json.page = this.pageSpec.spec();
    if (this.id != null) json.id = this.id;
    if (this.modifications.length > 0) json.modifications = this.modifications;
    return json;
  }

  static parseModification(modification) {
    if (modification.type == ROTATE) {
      return new Rotation(modification.angle);
    }
    return null;
  }

  static parse(json) {
    const pageSpec = PageSpec.parse(json.page)
    const id = json.id || null;
    const modifications = json.modifications ? json.modifications.map(x => ModificationDescriptor.parseModification(x)) : [];
    return new ModificationDescriptor(pageSpec, modifications, id);
  }

  rotate(angle) {
    const modifications = this.modifications.slice();
    if (modifications.length == 0) {
      modifications.push(new Rotation(angle));
    } else {
      const lastMod = modifications[modifications.length - 1];
      if (lastMod.type == ROTATE) {
        const newAngle = (ROTATION_MATRIX[lastMod.angle] || {})[angle];
        if (newAngle == null) {
          // Remove angle modification
          // modifications = modifications.slice(0, modifications.length - 1);
          modifications.splice(modifications.length - 1, 1);
        } else {
          modifications[modifications.length - 1] = new Rotation(newAngle);
        }
      } else {
        modifications.push(new Rotation(angle));
      }
    }
    return new ModificationDescriptor(this.pageSpec, modifications, this.id);
  }

  eq(other) {
    if (other.id == null && this.id != null) return false;
    if (other.id != null && this.id == null) return false;
    if (other.id != null && this.id != null && other.id != this.id) return false;
    if (other.modifications != null && this.modifications == null) return false;
    if (other.modifications == null && this.modifications != null) return false;
    if (other.modifications == null && this.modifications == null) return true;
    return arrayEq(this.modifications, other.modifications, (a, b) => a.eq(b));
  }

  pageSpecOp(op) {
    const pageSpec = op(this.pageSpec);
    return new ModificationDescriptor(pageSpec, this.modifications, this.id);
  }

  index(i) {
    return this.pageSpecOp(x => x.index(i));
  }

  length() {
    return this.pageSpec.length();
  }

  slice(i, length) {
    return this.pageSpecOp(x => x.slice(i, length));
  }

  compress() {
    return this.pageSpecOp(x => x.compress());
  }

  concat(otherOfSameKind) {
    return this.pageSpecOp(x => x.concat(otherOfSameKind.pageSpec));
  }
}

export class ModificationSpec {
  constructor(specs) {
    this.specs = specs;

    // Get page spec right away
    let pageSpecs = [];
    for (let i = 0; i < this.specs.length; i++) {
      const spec = this.specs[i];
      pageSpecs = pageSpecs.concat(spec.pageSpec.specs);
    }
    this.pageSpec = new PageSpec(pageSpecs).compress();
  }

  static empty() {
    return new ModificationSpec([]);
  }

  static getDocument(pageCount) {
    return new ModificationSpec([new ModificationDescriptor(new PageSpec([new Range(0, pageCount - 1)]), [], null)]);
  }

  static parse(json) {
    return new ModificationSpec(json.map(x => ModificationDescriptor.parse(x)));
  }

  json() {
    return this.specs.map(x => x.json());
  }

  toDescriptors() {
    let results = [];
    for (let i = 0; i < this.specs.length; i++) {
      results = results.concat(this.specs[i].toDescriptors());
    }
    return results;
  }

  rotate(angle) {
    const newSpecs = [];
    for (let i = 0; i < this.specs.length; i++) {
      newSpecs.push(this.specs[i].rotate(angle));
    }
    return new ModificationSpec(newSpecs).compress();
  }

  index(i) {
    for (let j = 0; j < this.specs.length; j++) {
      const spec = this.specs[j];
      const l = spec.length();
      if (i < l) return spec.index(i);
      i -= l;
    }
    return null;
  }

  length() {
    let sum = 0;
    for (let i = 0; i < this.specs.length; i++) {
      sum += this.specs[i].length();
    }
    return sum;
  }

  slice(i, length) {
    const newSpecs = [];
    for (let j = 0; j < this.specs.length; j++) {
      const spec = this.specs[j];
      const l = spec.length();
      if (i < l) {
        const newLength = Math.min(l - i, length);
        newSpecs.push(spec.slice(i, newLength));
        length -= newLength;
        if (length == 0) break;
      }
      i = Math.max(i - l, 0);
    }
    return new ModificationSpec(newSpecs).compress();
  }

  concat(other) {
    return new ModificationSpec(this.specs.concat(other.specs)).compress();
  }

  compress() {
    let currentSpec = null;
    const newSpecs = [];
    for (let i = 0; i < this.specs.length; i++) {
      const spec = this.specs[i];
      if (currentSpec != null) {
        if (currentSpec.eq(spec)) {
          // Same spec, can be merged
          currentSpec = currentSpec.concat(spec);
        } else {
          newSpecs.push(currentSpec);
          currentSpec = spec;
        }
      } else {
        currentSpec = spec;
      }
    }
    if (currentSpec != null) {
      newSpecs.push(currentSpec);
    }
    return new ModificationSpec(newSpecs);
  }

  applyModification(modification, pageSpec) {
    // Apply modification to indices specified by page spec
    let page = 0;
    let newSpecs = [];
    const pushUpTo = pg => {
      if (pg > page) {
        newSpecs = newSpecs.concat(this.slice(page, pg - page).specs);
      }
    };
    const pushModification = (start, length) => {
      const slice = modification(this.slice(start, length));
      newSpecs = newSpecs.concat(slice.specs);
    };

    for (let i = 0; i < pageSpec.specs.length; i++) {
      const spec = pageSpec.specs[i];
      if (spec instanceof Empty) continue;
      if (spec instanceof Individual) {
        pushUpTo(spec.pg);
        pushModification(spec.pg, 1);
        page = spec.pg + 1;
      }
      if (spec instanceof Range) {
        pushUpTo(spec.start);
        pushModification(spec.start, spec.end - spec.start + 1);
        page = spec.end + 1;
      }
    }
    pushUpTo(this.length());

    return new ModificationSpec(newSpecs).compress();
  }

  remove(pageSpec) {
    // Remove from indices specified by page spec
    let page = 0;
    let newSpecs = [];
    const pushUpTo = pg => {
      if (pg > page) {
        newSpecs = newSpecs.concat(this.slice(page, pg - page).specs);
      }
    };

    for (let i = 0; i < pageSpec.specs.length; i++) {
      const spec = pageSpec.specs[i];
      if (spec instanceof Empty) continue;
      if (spec instanceof Individual) {
        pushUpTo(spec.pg);
        page = spec.pg + 1;
      }
      if (spec instanceof Range) {
        pushUpTo(spec.start);
        page = spec.end + 1;
      }
    }
    pushUpTo(this.length());

    return new ModificationSpec(newSpecs).compress();
  }
}
