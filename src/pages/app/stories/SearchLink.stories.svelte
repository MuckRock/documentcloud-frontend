<script lang="ts" context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchLink from "../SearchLink.svelte";
  import { organizations, users } from "../../../test/handlers/accounts";
  import { projects } from "../../../test/handlers/projects";

  export const meta = {
    title: "App / Search / Search Link",
    component: SearchLink,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [users.data, organizations.data, projects.data],
    },
  }}
>
  <SearchLink link="/" />
</Story>
