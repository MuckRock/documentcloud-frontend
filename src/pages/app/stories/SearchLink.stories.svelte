<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchLink from "../SearchLink.svelte";
  import * as mock from "./mock.js";

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
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
    },
  }}
>
  <SearchLink link="/" />
</Story>
