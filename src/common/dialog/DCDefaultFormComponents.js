import {
  components as originalComponents,
  helpers,
  extra,
} from "@pyoner/svelte-form";

import Wrapper from "./DCFormWrapper.svelte";

/** @type {import('@pyoner/svelte-form/src/types').FormComponents} */
export const defaultFormComponents = {
  layout: originalComponents.layout,
  wrapper: Wrapper,
  form: originalComponents.form,
  itemWrapper: originalComponents.itemWrapper,
  itemCtrl: originalComponents.itemCtrl,
  addItem: originalComponents.addItem,
  fields: originalComponents.fields,
};

const Form = originalComponents.form;

export { Form, defaultFormComponents as components, helpers, extra };
