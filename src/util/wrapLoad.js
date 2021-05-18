export async function wrapLoadSeparate(loadWritable, errorStore, fn) {
  loadWritable.set(true);
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    errorStore.error = e;
  } finally {
    loadWritable.set(false);
  }
}

export async function wrapSeparate(loadStore, errorStore, fn) {
  if (loadStore != null) loadStore.loading = true;
  try {
    return await fn();
  } catch (e) {
    console.error(e);
    errorStore.error = e;
  } finally {
    if (loadStore != null) loadStore.loading = false;
  }
}

export async function wrapLoad(store, fn) {
  return await wrapSeparate(store, store, fn);
}

export async function wrapMultiple(store, ...fns) {
  return await wrapLoad(store, () => Promise.all(fns.map((fn) => fn())));
}

export async function wrapMultipleSeparate(loadStore, errorStore, ...fns) {
  return await wrapSeparate(loadStore, errorStore, () =>
    Promise.all(fns.map((fn) => fn())),
  );
}
