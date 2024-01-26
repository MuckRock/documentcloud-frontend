<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { userEvent, within } from "@storybook/testing-library";
  import { expect } from "@storybook/jest";

  import RevisionsDialog from "../RevisionsDialog.svelte";

  import documentFixture from "../../../pages/app/test/fixtures/document.json";
  import { revisionControl } from "./mockData";

  import { mockGetMe } from "../../../pages/app/accounts/stories/mockData";
  import { action } from "@storybook/addon-actions";

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
    onSave: action("Save"),
    onCancel: action("Cancel"),
  };

  export const meta = {
    title: "Dialogs / Revision",
    component: RevisionsDialog,
    parameters: {
      layout: "centered",
      chromatic: { delay: 1000 },
      cookie: {
        csrftoken: "mockToken",
      },
      cookiePreserve: true,
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

<Story
  name="With Revisions"
  {args}
  play={async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Display document revisions", async () => {
      await canvas.findByText("3 total");
    });
    await step("Download revisions", async () => {
      const downloadButtons = await canvas.getAllByText("Download");
      await expect(downloadButtons[0]).toHaveAttribute("target", "download");
    });
    await step("Toggle revisions", async () => {
      await canvas.findByText("Save document revision history");
      const checkbox = await canvas.getByRole("checkbox");
      await userEvent.click(checkbox);
      await expect(checkbox).not.toBeChecked();
      await userEvent.click(checkbox);
      await expect(checkbox).toBeChecked();
    });
  }}
  parameters={{
    msw: {
      handlers: [revisionControl.success, mockGetMe.data],
    },
  }}
/>
<Story
  name="With Zero Revisions"
  args={{ ...args, revisions: [] }}
  parameters={{
    msw: {
      handlers: [revisionControl.success, mockGetMe.data],
    },
  }}
/>
<Story
  name="With Many Revisions"
  args={{ ...args, revisions: manyRevisions }}
  parameters={{
    msw: {
      handlers: [revisionControl.success, mockGetMe.data],
    },
  }}
/>
<Story
  name="Disabled Revision Control"
  args={{ ...args, enabled: false }}
  parameters={{
    msw: {
      handlers: [revisionControl.success, mockGetMe.data],
    },
  }}
/>
<Story
  name="With Change Loading"
  {args}
  parameters={{ msw: { handlers: [revisionControl.loading, mockGetMe.data] } }}
/>
<Story
  name="With Change Error"
  {args}
  parameters={{ msw: { handlers: [revisionControl.error, mockGetMe.data] } }}
/>
<Story
  name="As Free Org Admin"
  {args}
  parameters={{
    msw: { handlers: [revisionControl.error, mockGetMe.freeOrgAdmin] },
  }}
/>
<Story
  name="As Free Org Member"
  {args}
  parameters={{
    msw: { handlers: [revisionControl.error, mockGetMe.freeOrgMember] },
  }}
/>
<Story
  name="With GetMe Error"
  {args}
  parameters={{ msw: { handlers: [revisionControl.success, mockGetMe.error] } }}
/>
<Story
  name="With Loading"
  {args}
  parameters={{
    msw: { handlers: [revisionControl.loading, mockGetMe.loading] },
  }}
/>
<Story
  name="Without CSRF Token"
  {args}
  parameters={{
    msw: { handlers: [revisionControl.success, mockGetMe.data] },
    cookie: {
      csrftoken: "",
    },
    cookiePreserve: false,
  }}
/>
