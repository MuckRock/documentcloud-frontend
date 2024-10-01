<script context="module" lang="ts">
  import { writable } from "svelte/store";
  import { Story } from "@storybook/addon-svelte-csf";
  import { pending } from "@/test/fixtures/documents/pending";
  import { progress } from "@/test/fixtures/addons/progress";
  import ProcessContext from "../ProcessContext.svelte";
  import ProcessDrawer from "../ProcessDrawer.svelte";

  import { runs } from "@/test/handlers/addons";
  import * as mock from "@/test/handlers/documents";

  export const meta = {
    title: "Components / Processing / Drawer",
    component: ProcessDrawer,
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
    <ProcessDrawer />
  </ProcessContext>
</Story>
