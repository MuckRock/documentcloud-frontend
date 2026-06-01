<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AccessLevel from "../AccessLevel.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Access Level",
    component: AccessLevel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  const args: Partial<ComponentProps<typeof AccessLevel>> = {
    selected: "private",
  };
</script>

<Story name="Private" {args} />
<Story name="Organization" args={{ ...args, selected: "organization" }} />
<Story name="Public" args={{ ...args, selected: "public" }} />
<Story name="Row" args={{ ...args, direction: "row" }} />
<Story name="Required" args={{ required: true, selected: undefined }} />
