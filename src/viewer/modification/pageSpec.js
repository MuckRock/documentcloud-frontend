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
    const pg = pageNumbers[i];
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
