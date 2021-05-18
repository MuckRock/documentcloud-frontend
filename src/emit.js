import { createEventDispatcher } from "svelte";

export default function (dict) {
  const dispatch = createEventDispatcher();

  const result = {};
  Object.keys(dict).forEach((key) => {
    result[key] = (args) => dispatch(key, args);
  });
  return result;
}
