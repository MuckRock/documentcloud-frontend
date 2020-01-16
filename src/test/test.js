import deepEq from 'fast-deep-equal';

export class Tester {
  constructor() { }

  assert(condition) {
    if (!condition) throw Error(`Expected ${condition} to be truthy`);
  }

  eq(msg, obj1, obj2) {
    if (obj1 != obj2) {
      console.error(obj1, obj2);
      throw Error(`${msg}: Expected above objects to equal`);
    } else {
      console.log(`${msg}:`, obj1, '==', obj2);
    }
  }

  deepEq(msg, obj1, obj2) {
    if (!deepEq(obj1, obj2)) {
      console.error(obj1, obj2);
      throw Error(`${msg}: Expected above objects to deep equal`);
    } else {
      console.log(`${msg}:`, obj1, 'deep equals', obj2);
    }
  }
}

function overrideConsole() {
  const _console = window['console'];
  window['console'] = {
    log() { },
    error() { },
    group() { },
    groupCollapsed() { },
    groupEnd() { }
  }
  return _console;
}

function restoreConsole(oldConsole) {
  window['console'] = oldConsole;
}

export function test(message, runner) {
  const oldConsole = overrideConsole();

  const runTest = () => runner(new Tester(this));

  let passes = true;
  try {
    runTest();
  } catch (e) {
    passes = false;
  }

  restoreConsole(oldConsole);

  if (passes) {
    console.groupCollapsed(`%c TESTING ${message}`, 'color: green');
  } else {
    console.group(`%c TESTING ${message}`, 'color: red');
  }

  try {
    runTest();
    console.log("===========\nTEST PASSED\n-----------")
  } catch (e) {
    throw (e);
  } finally {
    console.groupEnd();
  }
}
