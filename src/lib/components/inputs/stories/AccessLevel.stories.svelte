<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AccessLevel from "../AccessLevel.svelte";

  const { Story } = defineMeta({
    title: "Forms / Inputs /Access Level",
    component: AccessLevel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="Private" args={{ selected: "private" }} />
<Story name="Organization" args={{ selected: "organization" }} />
<Story name="Public" args={{ selected: "public" }} />
<Story name="Row" args={{ selected: "private", direction: "row" }} />
<Story name="Required" args={{ required: true, selected: null }} />
