import { components as originalComponents, helpers, extra} from "@pyoner/svelte-form";
import type { FormComponents } from "@pyoner/svelte-form/src/types";

import Wrapper from "./DCFormWrapper.svelte";
// import Layout from "./Layout.svelte";
// import Form from "./Form.svelte";
// import ItemWrapper from "./ItemWrapper.svelte";
// import ItemCtrl from "./ItemCtrl.svelte";
// import AddItem from "./AddItem.svelte";
// import { defaultFieldComponents as fields } from "./fields";

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

// export { Wrapper, Layout, Form, ItemWrapper, ItemCtrl, AddItem, fields };
export { Form, defaultFormComponents as components, helpers, extra }
