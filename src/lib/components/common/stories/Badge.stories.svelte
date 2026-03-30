<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Badge from "../Badge.svelte";
  import Star from "$lib/components/icons/Star.svelte";

  const { Story } = defineMeta({
    title: "Common / Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Badge,
    argTypes: { selected: { control: "boolean" } },
    render: template,
  });
</script>

{#snippet template(args)}
  <Badge {...args}>
    <Star slot="icon" />
  </Badge>
{/snippet}

<Story name="Light Color" args={{ label: "Featured", badgeColor: "yellow" }} />
<Story
  name="Dark Color"
  args={{
    label: "Pinned",
    badgeColor: "purple",
    labelColor: "white",
  }}
/>
