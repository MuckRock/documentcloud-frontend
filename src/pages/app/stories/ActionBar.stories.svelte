<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import ActionBar from "../ActionBar.svelte";

  import { document } from "../../../test/fixtures/documents";

  export const meta = {
    title: "App / Action Bar",
    component: ActionBar,
    tags: ["autodocs"],
  };

  const args = {
    loggedIn: true,
    data: {
      loading: false,
      documents: [document, document, document],
    },
    selection: {
      checked: false,
      indeterminate: false,
      editable: true,
      onUncheck: action("Uncheck"),
      onCheck: action("Check"),
    },
    pagination: {
      page: 4,
      totalPages: 12,
      totalItems: 300,
      has_next: true,
      has_prev: true,
      onNext: action("Next Page"),
      onPrev: action("Prev Page"),
    },
  };
</script>

<Template let:args>
  <ActionBar {...args} />
</Template>

<Story name="Default" {args} />
<Story
  name="Not editable"
  args={{
    ...args,
    selection: { ...args.selection, editable: false, checked: true },
  }}
/>
