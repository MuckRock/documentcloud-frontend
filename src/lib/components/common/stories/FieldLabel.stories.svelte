<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FieldLabel from "../FieldLabel.svelte";
  import { Infinity16 } from "svelte-octicons";

  const { Story } = defineMeta({
    title: "Common / Field Label",
    component: FieldLabel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    render: template,
  });

  let args = {
    required: false,
    premium: false,
  };
</script>

{#snippet template(args)}
  <FieldLabel {...args}>Input Label</FieldLabel>
{/snippet}

<Story name="Default" {args} />
<Story name="With Icon" {args}>
  {#snippet template(args)}
    <FieldLabel {...args}
      ><Infinity16 slot="icon" />Never-Ending Salad & Breadsticks</FieldLabel
    >
  {/snippet}
</Story>
<Story name="Required" args={{ ...args, required: true }} />
<Story name="Premium" args={{ ...args, premium: true }} />
