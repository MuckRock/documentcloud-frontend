<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import { Infinity16 } from "svelte-octicons";
  import FieldLabel from "../FieldLabel.svelte";

  const { Story } = defineMeta({
    title: "Common / Field Label",
    component: FieldLabel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

{#snippet children()}Input Label{/snippet}

<Story name="Default" args={{ children }} />
<Story name="With Icon" args={{ children, icon: Infinity16 }} />
<Story name="Required" args={{ children, required: true }} />
<Story name="Premium" args={{ children, premium: true }} />
