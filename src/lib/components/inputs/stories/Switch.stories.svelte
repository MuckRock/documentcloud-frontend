<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Switch from "../Switch.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Switch",
    component: Switch,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  const args = {
    checked: false,
    disabled: false,
  };
</script>

<Story name="Off" {args} />
<Story name="On" args={{ ...args, checked: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
