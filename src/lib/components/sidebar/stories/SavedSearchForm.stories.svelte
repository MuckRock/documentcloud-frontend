<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import { Story } from "@storybook/addon-svelte-csf";
  import SavedSearchForm from "../SavedSearchForm.svelte";

  export const meta: Meta = {
    title: "Navigation / SavedSearchForm",
    component: SavedSearchForm,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Create">
  <div style="width: 24rem;">
    <SavedSearchForm
      initialQuery="police report"
      onclose={() => {}}
      onsave={() => {}}
    />
  </div>
</Story>

<Story name="Edit">
  <div style="width: 24rem;">
    <SavedSearchForm
      savedSearch={{
        uuid: "test-uuid",
        name: "Police reports",
        query: "police report",
        created_at: "2026-01-15T10:30:00Z",
        updated_at: "2026-01-15T10:30:00Z",
      }}
      onclose={() => {}}
      onsave={() => {}}
      ondelete={() => {}}
    />
  </div>
</Story>

<Story name="Empty (no initial query)">
  <div style="width: 24rem;">
    <SavedSearchForm onclose={() => {}} onsave={() => {}} />
  </div>
</Story>
