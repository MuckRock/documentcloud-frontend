<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";

  import DropZone from "../DropZone.svelte";

  const args = {
    secondary: false,
    message: "Drop files here",
  };

  export const meta = {
    title: "Common / Drop Zone",
    component: DropZone,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<style>
  .container {
    width: 600px;
  }
</style>

<Template let:args>
  <div class="container">
    <DropZone secondary={args.secondary}>
      {args.message}
    </DropZone>
  </div>
</Template>

<Story name="Primary" {args} />
<Story name="Secondary" args={{ ...args, secondary: true }} />
