<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Access from "../Access.svelte";
  import { getLevels } from "$lib/utils/access";

  const { Story } = defineMeta({
    title: "Common / Access",
    component: Access,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  const levels = getLevels();
  const noteLevels = getLevels("note");
</script>

<Story name="Private" args={{ level: levels[0] }} />
<Story name="Organization" args={{ level: levels[1] }} />
<Story name="Public" args={{ level: levels[2] }} />
<Story name="Note Private" args={{ level: noteLevels[0] }} />
<Story name="Note Collaborators" args={{ level: noteLevels[1] }} />
<Story name="Note Public" args={{ level: noteLevels[2] }} />
