<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import OrgMenu from "../OrgMenu.svelte";

  import { organization } from "@/test/fixtures/accounts";

  export const meta = {
    title: "Components / Org Menu",
    component: OrgMenu,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Org Menu" id="orgMenu">
  <OrgMenu org={organization} />
</Story>
