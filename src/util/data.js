/**
 * Patches the provided data with the specified user data.
 * @param {Object} data The starting data.
 * @param {Object} me The user data.
 */
export function injectMe(data, me) {
  data.user = me;
  data.organization = me.organization;
  return data;
}
