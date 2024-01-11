<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import RevisionIcon from "../RevisionIcon.svelte";

  import documentFixture from "../../pages/app/test/fixtures/document.json";

  const args = {
    revisions: documentFixture.revisions,
    showCount: true,
  };

  const handleClick = action("click");
</script>

<Meta
  title="Common / Revision Icon"
  component={RevisionIcon}
  parameters={{
    layout: "centered",
  }}
/>

<Template let:args>
  <RevisionIcon {...args} on:click={handleClick} />
</Template>

<Story name="With Revisions" {args} />
<Story name="Without Revisions" args={{ ...args, revisions: [] }} />
<Story name="Hide Count" args={{ ...args, showCount: false }} />
