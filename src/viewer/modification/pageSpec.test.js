import { runify, PageSpec, Empty } from "./pageSpec";

function runspec(pgNumbers) {
  return runify(pgNumbers).spec();
}

function getNumbers(spec) {
  return PageSpec.parse(spec).toNumbers();
}

function getLength(spec) {
  return PageSpec.parse(spec).length();
}

function getIndex(spec, i) {
  return PageSpec.parse(spec).index(i);
}

function slice(spec, i, l) {
  return PageSpec.parse(spec).slice(i, l).toNumbers();
}

function sliceSpec(spec, i, l) {
  return PageSpec.parse(spec).slice(i, l).spec();
}

function concatSpec(...specs) {
  return specs.reduce((prev, current) => prev.concat(PageSpec.parse(current)), new PageSpec([new Empty()])).spec();
}

test("page spec", () => {
  expect(runspec([])).toBe('');
  expect(runspec([1])).toBe('1');
  expect(runspec([1, 2, 3])).toBe('1-3');
  expect(runspec([1, 3])).toBe('1,3');
  expect(runspec([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1])).toBe('1,3-4,7-9,1-5,1');
});

test("page spec to numbers", () => {
  expect(runify([]).toNumbers()).toEqual([]);
  expect(runify([1]).toNumbers()).toEqual([1]);
  expect(runify([1, 2, 3]).toNumbers()).toEqual([1, 2, 3]);
  expect(runify([1, 3]).toNumbers()).toEqual([1, 3]);
  expect(runify([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]).toNumbers()).toEqual([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]);
});

test('parse page spec', () => {
  expect(getNumbers('')).toEqual([]);
  expect(getNumbers('1')).toEqual([1]);
  expect(getNumbers('1-3')).toEqual([1, 2, 3]);
  expect(getNumbers('1,3')).toEqual([1, 3]);
  expect(getNumbers('1,3-4,7-9,1-5,1')).toEqual([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]);
});

test('length', () => {
  expect(getLength('')).toBe(0);
  expect(getLength('1')).toBe(1);
  expect(getLength('1-3')).toBe(3);
  expect(getLength('1,3')).toBe(2);
  expect(getLength('1,3-4,7-9,1-5,1')).toBe(12);
});

test('index', () => {
  expect(getIndex('1', 0)).toBe(1);
  expect(getIndex('1-3', 0)).toBe(1);
  expect(getIndex('1-3', 1)).toBe(2);
  expect(getIndex('1-3', 2)).toBe(3);
  expect(getIndex('1,3', 0)).toBe(1);
  expect(getIndex('1,3', 1)).toBe(3);
  expect(getIndex('1,3-4,7-9,1-5,1', 0)).toBe(1);
  expect(getIndex('1,3-4,7-9,1-5,1', 1)).toBe(3);
  expect(getIndex('1,3-4,7-9,1-5,1', 2)).toBe(4);
  expect(getIndex('1,3-4,7-9,1-5,1', 3)).toBe(7);
  expect(getIndex('1,3-4,7-9,1-5,1', 4)).toBe(8);
  expect(getIndex('1,3-4,7-9,1-5,1', 5)).toBe(9);
  expect(getIndex('1,3-4,7-9,1-5,1', 6)).toBe(1);
  expect(getIndex('1,3-4,7-9,1-5,1', 7)).toBe(2);
  expect(getIndex('1,3-4,7-9,1-5,1', 8)).toBe(3);
  expect(getIndex('1,3-4,7-9,1-5,1', 9)).toBe(4);
  expect(getIndex('1,3-4,7-9,1-5,1', 10)).toBe(5);
  expect(getIndex('1,3-4,7-9,1-5,1', 11)).toBe(1);
});

test('slice test', () => {
  expect(slice('1-3', 1, 1)).toEqual([2]);
  expect(slice('1-3', 0, 2)).toEqual([1, 2]);
  expect(slice('1-3', 2, 0)).toEqual([]);
  expect(slice('1', 0, 1)).toEqual([1]);
  expect(slice('1', 0, 0)).toEqual([]);
  expect(slice('1-3,10-13', 0, 3)).toEqual([1, 2, 3]);
  expect(slice('1-3,10-13', 0, 6)).toEqual([1, 2, 3, 10, 11, 12]);
  expect(slice('1-3,10-13', 1, 4)).toEqual([2, 3, 10, 11]);
  expect(slice('1,3-4,7-9,1-5,1', 4, 6)).toEqual([8, 9, 1, 2, 3, 4]);
  expect(slice('1-3,4,5', 2, 3)).toEqual([3, 4, 5]);
});

test('slice spec', () => {
  expect(sliceSpec('1-3,4,5', 2, 3)).toBe('3-5');
  expect(sliceSpec('1-3,4,5', 1, 1)).toBe('2');
  expect(sliceSpec('1-3,4,5', 1, 2)).toBe('2-3');
  expect(sliceSpec('1,3-4,7-9,1-5,1', 4, 6)).toBe('8-9,1-4');
  expect(sliceSpec('1,3-4,7-9,1-5,1', 4, 8)).toBe('8-9,1-5,1');
  expect(sliceSpec('', 0, 0)).toBe('');
  expect(sliceSpec('1-100', 0, 0)).toBe('');
  expect(sliceSpec('1-100,1-100', 50, 100)).toBe('51-100,1-50');
});

test('concat spec', () => {
  expect(concatSpec('1-3', '4-6')).toBe('1-6');
  expect(concatSpec('1', '2', '3', '4')).toBe('1-4');
  expect(concatSpec('1', '2-3', '4-5', '6', '7-8', '9')).toBe('1-9');
  expect(concatSpec('1', '2-3', '4-5', '7-8', '9')).toBe('1-5,7-9');
  expect(concatSpec('1', '2-3', '4-5', '7-8', '9', '11')).toBe('1-5,7-9,11');
});
