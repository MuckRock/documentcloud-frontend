export default function(fn) {
  return async function(context, ...args) {
    const hasContext = context != null && context.loading != null;
    if (hasContext) {
      context.loading = true;
    }
    try {
      return await fn(...args);
    } catch (e) {
      throw e;
    } finally {
      if (hasContext) {
        context.loading = false;
      }
    }
  };
}
