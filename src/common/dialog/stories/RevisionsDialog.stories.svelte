<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import RevisionsDialog from "../RevisionsDialog.svelte";

  import documentFixture from "../../../pages/app/test/fixtures/document.json";

  const args = {
    revisions: documentFixture.revisions,
  };
</script>

<Meta
  title="Dialogs / Revisions"
  component={RevisionsDialog}
  parameters={{
    layout: "centered",
  }}
/>

<Template let:args>
  <RevisionsDialog {...args} />
</Template>

<Story name="With Revisions" {args} />
<Story name="Without Revisions" args={{ ...args, revisions: [] }} />
<Story name="Hide Count" args={{ ...args, showCount: false }} />
