<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { running } from "../AddOns.svelte";
  import { current } from "../Documents.svelte";
  import ProcessDrawer from "../ProcessDrawer.svelte";

  import { runs } from "@/test/handlers/addons";
  import * as mock from "@/test/handlers/documents";

  export const meta = {
    title: "Components / Processing / Drawer",
    component: ProcessDrawer,
    parameters: { layout: "fullscreen" },
  };
</script>

<script lang="ts">
  import { pending } from "@/test/fixtures/documents/pending";
  import { progress } from "@/test/fixtures/addons/progress";
  import { onMount } from "svelte";
  import Toaster, { toast } from "../../layouts/Toaster.svelte";

  onMount(() => {
    setTimeout(() => {
      $running = progress;
      $current = pending;
    }, 500);
    setTimeout(() => {
      toast("Process succeeded!", { status: "success" });
    }, 1500);
  });
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [runs.running, mock.documents.list, mock.documents.pending],
    },
  }}
>
  <ProcessDrawer />
  <Toaster />
</Story>
