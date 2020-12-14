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
}

export class PageSpec {
  constructor(specs) {
    this.specs = specs;
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
