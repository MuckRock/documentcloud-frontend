<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProcessContext from "../ProcessContext.svelte";
  import ProcessDropdown from "../ProcessDropdown.svelte";

  import { runs } from "@/test/handlers/addons";
  import * as mock from "@/test/handlers/documents";

  export const meta = {
    title: "Components / Processing / Dropdown",
    component: ProcessDropdown,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [runs.running, mock.documents.list, mock.documents.pending],
    },
  }}
>
  <ProcessContext>
    <ProcessDropdown />
  </ProcessContext>
</Story>
