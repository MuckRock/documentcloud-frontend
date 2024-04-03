<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import OrgMenu from "../accounts/OrgMenu.svelte";

  export const meta = {
    title: "Components / Org Menu",
    component: OrgMenu,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Org Menu" id="orgMenu">
  <OrgMenu />
</Story>
