<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import SavedSearchForm from "../SavedSearchForm.svelte";

  const { Story } = defineMeta({
    title: "Navigation / SavedSearchForm",
    component: SavedSearchForm,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <div style="width: 24rem;">
    <SavedSearchForm {...args} />
  </div>
{/snippet}

<Story
  name="Create"
  args={{
    initialQuery: "police report",
    onclose: () => {},
    onsave: () => {},
  }}
/>

<Story
  name="Edit"
  args={{
    savedSearch: {
      uuid: "test-uuid",
      name: "Police reports",
      query: "police report",
      created_at: "2026-01-15T10:30:00Z",
      updated_at: "2026-01-15T10:30:00Z",
    },
    onclose: () => {},
    onsave: () => {},
    ondelete: () => {},
  }}
/>

<Story
  name="Empty (no initial query)"
  args={{
    onclose: () => {},
    onsave: () => {},
  }}
/>
