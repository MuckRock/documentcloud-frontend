import { renderer, setAspect } from './renderer';
import { test as _test } from '@/test/test';

function resetRenderer() {
  renderer.aspects = [];
  renderer.width = 0;
}

function test(name, fn) {
  // Wrap test with resetter
  return _test(name, t => {
    resetRenderer();
    return fn(t);
  })
}

function aspects(l) {
  return l.map(x => ({ aspect: x }));
}

test('page count', t => {
  renderer.aspects = aspects([1, 1, 1]);
  t.eq('page count 3', renderer.pageCount, 3);

  renderer.aspects = [];
  t.eq('page count 0', renderer.pageCount, 0);
});

test('average aspect', t => {
  renderer.aspects = aspects([1, 2, 3]);
  t.eq('avg aspect 2', renderer.averageAspect, 2);
  t.deepEq('aspects gapped', renderer.aspects, aspects([1, 2, 3]));
  t.deepEq('computed aspects gapped', renderer.computedAspects, aspects([1, 2, 3]));

  setAspect(2, 6);
  t.eq('avg aspect 3', renderer.averageAspect, 3);
  t.deepEq('aspects gapped', renderer.aspects, aspects([1, 2, 6]));
  t.deepEq('computed aspects gapped', renderer.computedAspects, aspects([1, 2, 6]));


  setAspect(1, null);
  t.eq('avg aspect 3.5', renderer.averageAspect, 3.5);
  t.deepEq('aspects gapped', renderer.aspects, aspects([1, null, 6]));
  t.deepEq('computed aspects gapped', renderer.computedAspects, aspects([1, 3.5, 6]));
});

test('aspect runs', t => {
  renderer.aspects = [
    { aspect: 1 },
    { aspect: 2, note: 1 },
    { aspect: 3 },
    { aspect: 4 }
  ];
  t.deepEq('aspect runs with one note', renderer.aspectRuns, [
    {
      type: 'pages', total: 1, count: 1, start: 0, end: 1, skipStartPageNumber: false,
    },
    {
      type: 'note', note: 1, page: 1,
    },
    {
      type: 'pages', total: 9, count: 3, start: 1, end: 4, skipStartPageNumber: true
    }
  ]);

  renderer.aspects = [
    { aspect: 1, note: 1 },
    { aspect: 2, note: 2 },
  ];

  t.deepEq('aspect runs with two notes', renderer.aspectRuns, [
    {
      type: 'note', note: 1, page: 0,
    },
    {
      type: 'pages', total: 1, count: 1, start: 0, end: 1, skipStartPageNumber: true,
    },
    {
      type: 'note', note: 2, page: 1,
    },
    {
      type: 'pages', total: 2, count: 1, start: 1, end: 2, skipStartPageNumber: true
    }
  ]);

  renderer.aspects = [
    { aspect: 1 },
    { aspect: null, note: 1 },
    { aspect: 3 },
    { aspect: 5 }
  ];
  t.deepEq('aspect runs with a hole', renderer.aspectRuns, [
    {
      type: 'pages', total: 1, count: 1, start: 0, end: 1, skipStartPageNumber: false,
    },
    {
      type: 'note', note: 1, page: 1,
    },
    {
      type: 'pages', total: 11, count: 3, start: 1, end: 4, skipStartPageNumber: true
    }
  ]);

  renderer.aspects = [
    { aspect: 1 },
    { aspect: 2 },
    { aspect: 3 },
    { aspect: 4 }
  ];
  t.deepEq('aspect runs with no notes', renderer.aspectRuns, [
    {
      type: 'pages', total: 10, count: 4, start: 0, end: 4, skipStartPageNumber: false,
    }
  ]);

  renderer.aspects = [];
  t.deepEq('empty aspects', renderer.aspectRuns, []);
});
