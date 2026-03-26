<script lang="ts">
  import type { SavedSearch } from "$lib/api/types";

  import SavedSearchForm from "../SavedSearchForm.svelte";

  interface Props {
    savedSearch?: SavedSearch;
    initialQuery?: string;
    onsave?: (s: SavedSearch) => void;
    onclose?: () => void;
    ondelete?: (uuid: string) => void;
  }

  let {
    savedSearch,
    initialQuery = "",
    onsave = () => {},
    onclose = () => {},
    ondelete = () => {},
  }: Props = $props();
</script>

<SavedSearchForm
  {savedSearch}
  {initialQuery}
  {onsave}
  {onclose}
  {ondelete}
/>
