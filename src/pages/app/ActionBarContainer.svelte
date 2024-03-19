<script lang="ts">
  import { search, searchNext, searchPrev } from "../../search/search.js";
  import { documents, unselectAll } from "../../manager/documents";
  import { layout } from "../../manager/layout";
  import { manager, selectAll } from "../../manager/manager";
  import { orgsAndUsers } from "../../manager/orgsAndUsers";
  import ActionBar from "./ActionBar.svelte";

  $: loggedIn = $orgsAndUsers.loggedIn;

  $: data = {
    loading: $layout.loading,
    documents: $documents.documents,
  };

  $: selection = {
    checked: $layout.hasSelection,
    indeterminate: $manager.someSelected,
    editable: $layout.selectionEditables,
    onCheck: selectAll,
    onUncheck: unselectAll,
  };

  $: pagination = {
    page: $search.page,
    totalPages: $search.results?.numPages,
    totalItems: $search.results?.count,
    has_next: $search.hasNext,
    has_prev: $search.hasPrev,
    onNext: searchNext,
    onPrev: searchPrev,
  };
</script>

<ActionBar {loggedIn} {data} {selection} {pagination} />
