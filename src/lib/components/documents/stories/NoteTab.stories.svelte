<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import NoteTab from "../NoteTab.svelte";

  export const meta = {
    title: "Components / Documents / Note tab",
    component: NoteTab,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="public note">
  <NoteTab access="public" />
</Story>

<Story name="organization note">
  <NoteTab access="organization" />
</Story>

<Story name="private note">
  <NoteTab access="private" />
</Story>

<Story name="small">
  <NoteTab size="small" />
</Story>
