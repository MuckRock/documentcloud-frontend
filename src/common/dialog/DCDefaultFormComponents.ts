import {
  components as originalComponents,
  helpers,
  extra,
} from "@pyoner/svelte-form";
import type { FormComponents } from "@pyoner/svelte-form/src/types";

import Wrapper from "./DCFormWrapper.svelte";

export const defaultFormComponents: FormComponents = {
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
