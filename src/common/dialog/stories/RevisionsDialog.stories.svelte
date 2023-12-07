<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import RevisionsDialog from "../RevisionsDialog.svelte";

  import documentFixture from "../../../pages/app/test/fixtures/document.json";
  import { revisionControl } from "./mockData";

  const today = new Date().getDate();
  const manyRevisions = Array(100)
    .fill(1)
    .map((n, i) => n + i)
    .map((version) => ({
      version,
      // Create a range of dates for each revision—this goes back multiple years
      created_at: new Date().setDate(today - (1001 - version * 10)),
      comment: `Revision ${version}`,
      user: 1,
      url: "test",
    }));

  const args = {
    enabled: true,
    documentId: "1",
    revisions: documentFixture.revisions,
  };

  export const meta = {
    title: "Dialogs / Revision",
    component: RevisionsDialog,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [revisionControl.success],
      },
    },
    argTypes: {
      enabled: {
        control: {
          type: "boolean",
        },
      },
    },
  };
</script>

<Template let:args>
  <RevisionsDialog {...args} />
</Template>

<Story name="With Revisions" {args} />
<Story name="With Zero Revisions" args={{ ...args, revisions: [] }} />
<Story
  name="With Many Revisions"
  args={{ ...args, revisions: manyRevisions }}
/>
<Story name="Disabled Revision Control" args={{ ...args, enabled: false }} />
<Story
  name="With Change Loading"
  {args}
  parameters={{ msw: { handlers: [revisionControl.loading] } }}
/>
<Story
  name="With Change Error"
  {args}
  parameters={{ msw: { handlers: [revisionControl.error] } }}
/>
