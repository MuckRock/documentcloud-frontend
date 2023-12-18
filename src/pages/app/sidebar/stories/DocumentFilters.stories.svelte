<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import DocumentFiltersComponent from "../DocumentFilters.svelte";

  import * as mock from "../../stories/mock.js";

  export const meta = {
    title: "App / Sidebar / Document Filters",
    component: DocumentFiltersComponent,
    parameters: { layout: "centered" },
  };
</script>

<Story
  name="Document Filters"
  parameters={{
    msw: {
      handlers: [
        mock.users.data,
        mock.users.me,
        mock.organizations.data,
        mock.projects.data,
      ],
    },
  }}
>
  <DocumentFiltersComponent />
</Story>
