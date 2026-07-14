<script module lang="ts">
  import type { ComponentProps } from "svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import NoteTab from "../NoteTab.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Note tab",
    component: NoteTab,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  let args = {
    access: "public",
    size: "normal",
  } satisfies ComponentProps<typeof NoteTab>;
</script>

<Story name="public note" {args} />

<Story name="organization note" args={{ ...args, access: "organization" }} />

<Story name="private note" args={{ ...args, access: "private" }} />

<Story name="small note" args={{ ...args, size: "small" }} />
