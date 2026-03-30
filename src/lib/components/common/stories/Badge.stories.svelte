<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import Badge from "../Badge.svelte";
  import Star from "$lib/components/icons/Star.svelte";

  const { Story } = defineMeta({
    title: "Common / Badge",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Badge,
    argTypes: { small: { control: "boolean" } },
  });
</script>

<Story
  name="Light Color"
  args={{ label: "Featured", badgeColor: "yellow", icon: Star }}
/>
<Story
  name="Dark Color"
  args={{
    label: "Pinned",
    badgeColor: "purple",
    labelColor: "white",
    icon: Star,
  }}
/>
