import Text from "./Text.svelte";
import Number from "./Number.svelte";

const fields = {
  string: Text,
  number: Number,
};

export function get(field = {}) {}
