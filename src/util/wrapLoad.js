export async function wrapLoad(store, fn) {
  store.loading = true;
  try {
    return (await fn());
  } catch (e) {
    store.error = e;
    console.log(e);
  } finally {
    store.loading = false;
  }
}

export async function wrapMultiple(store, ...fns) {
  return await wrapLoad(store, () => Promise.all(fns.map(fn => fn())));
}
