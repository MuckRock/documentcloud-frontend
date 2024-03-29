import ArrayField from "./ArrayField.svelte";
import Checkbox from "./Checkbox.svelte";
import Number from "./Number.svelte";
import Text from "./Text.svelte";
import Select from "./Select.svelte";

// https://json-schema.org/understanding-json-schema/reference/type.html
const fields = {
  string: Text,
  number: Number,
  integer: Number,
  boolean: Checkbox,
  null: null,

  // compound fields, tbd
  array: ArrayField,
  object: null,
};

/**
 * Automatically get a form field component based on the property type of a JSON schema object
 *
 * @export
 * @param {object} params
 * @returns {import("svelte").ComponentType}
 */
export function autofield(params, fallback = Text) {
  const type = String(params.type).toLowerCase();

  if (!fields[type]) {
    console.warn("Unknown field type: %s", type);
    return fallback;
  }

  // only string enums for now
  if (type === "string" && params.enum) {
    return Select;
  }

  return fields[type];
}
