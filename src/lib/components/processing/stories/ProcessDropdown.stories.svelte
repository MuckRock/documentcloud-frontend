<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProcessContext from "../ProcessContext.svelte";
  import ProcessDropdown from "../ProcessDropdown.svelte";

  import { runs } from "@/test/handlers/addons";
  import * as mock from "@/test/handlers/documents";

  const { Story } = defineMeta({
    title: "Processing / Dropdown",
    component: ProcessDropdown,
    parameters: { layout: "fullscreen" },
  });
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [runs.running, mock.documents.list, mock.documents.pending],
    },
  }}
  asChild
>
  <ProcessContext>
    <ProcessDropdown />
  </ProcessContext>
</Story>
