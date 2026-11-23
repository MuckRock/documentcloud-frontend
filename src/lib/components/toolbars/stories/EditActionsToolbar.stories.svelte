<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import EditActionsToolbar from "../EditActionsToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Edit Actions",
    component: EditActionsToolbar,
    parameters: { layout: "centered" },
    args: { onEdit: fn() },
  });
</script>

<!-- One page's controls in edit mode. -->
<Story name="Page" args={{ mode: "edit" }} />

<Story name="First page" args={{ mode: "edit", first: true }} />

<Story name="Last page" args={{ mode: "edit", last: true }} />

<!-- Applies to every selected page, so it has no move actions. -->
<Story name="Bulk" args={{ mode: "bulk" }} />

<Story name="Bulk, nothing selected" args={{ mode: "bulk", disabled: true }} />
