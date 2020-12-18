import { modification } from './modification';
import { ModificationSpec } from './modifySpec';

beforeEach(() => {
  modification.clear();
  modification.modifySpec = ModificationSpec.getDocument(3);
});

test('insertion double hit clears', () => {
  expect(modification.hasInsert).toBe(false);
  modification.selectInsert(0);
  expect(modification.hasInsert).toBe(true);
  modification.selectInsert(0);
  expect(modification.hasInsert).toBe(false);
});

test('rewind spec', () => {
  modification.select([0, 2]);
  expect(modification.modifyNumSelected).toBe(2);
  modification.cut();
  expect(modification.pageCount).toBe(1);
  modification.clearCopyBuffer();
  expect(modification.pageCount).toBe(3);
});

test('remove', () => {
  modification.select([0, 1]);
  modification.remove();
  expect(modification.modifyNumSelected).toBe(0);
});

test('copy then remove', () => {
  modification.select([0, 2]);
  modification.copy();
  modification.pasteAtEnd();
  expect(modification.pageCount).toBe(5);
  // Now remove specific pages
  modification.select([2, 4]);
  modification.remove();
  expect(modification.pageCount).toBe(3);
});

test('rotate middle page', () => {
  modification.select([1]);
  modification.rotateClockwise();
  expect(modification.pageCount).toBe(3);
});

test('rotate last two pages', () => {
  modification.select([1, 2]);
  modification.rotateClockwise();
  expect(modification.pageCount).toBe(3);
});

test('cut end to middle', () => {
  modification.select([2]);
  modification.cut();
  modification.selectInsert(0);
  modification.pasteAtInsert();
  expect(modification.modifySpec.json()).toEqual([{
    page: "2,0-1"
  }]);
});
