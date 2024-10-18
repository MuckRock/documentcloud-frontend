<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import NoteTab from "../NoteTab.svelte";

  export const meta = {
    title: "Components / Viewer / Note tab",
    component: NoteTab,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    access: "public",
    size: "normal",
  };
</script>

<Template let:args>
  <NoteTab {...args} />
</Template>

<Story name="public note" {args} />

<Story name="organization note" args={{ ...args, access: "organization" }} />

<Story name="private note" args={{ ...args, access: "private" }} />

<Story name="small note" args={{ ...args, size: "small" }} />
