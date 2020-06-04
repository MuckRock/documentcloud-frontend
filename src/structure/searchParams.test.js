import { SearchParams } from './searchParams';

function params(query) {
  return new SearchParams({ q: query });
}

test('user search', () => {
  expect(params('user:bob-1000').oneUserSearch).toBe(1000);

  // One user search is not true if other text is included
  expect(params('user:bob-1000 othertext').oneUserSearch).toBe(null);
});

test('user search', () => {
  expect(params('organization:muckrock-1234').oneOrgSearch).toBe(1234);

  // One org search is not true if other text is included
  expect(params('organization:muckrock-1234 othertext').oneOrgSearch).toBe(null);
});

test('project search', () => {
  expect(params('project:lawsuits-123').oneProjectSearch).toBe(123);

  // One project search is not true if other text is included
  expect(params('project:lawsuits-123 othertext').oneProjectSearch).toBe(null);
});

test('access search', () => {
  expect(params('access:public').oneAccessSearch).toBe('public');
  expect(params('access:private').oneAccessSearch).toBe('private');
  expect(params('access:notreal').oneAccessSearch).toBe(null);
  expect(params('access:public othertext').oneAccessSearch).toBe(null);
});

test('all search', () => {
  expect(params('').isAllSearch).toBe(true);
  expect(params('hi').isAllSearch).toBe(false);
});
