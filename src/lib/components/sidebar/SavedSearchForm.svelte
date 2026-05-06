<!-- @component
Form for creating or editing a saved search.
Renders inside a modal.
-->
<script lang="ts">
  import type { SavedSearch } from "$lib/api/types";

  import { untrack } from "svelte";
  import { _ } from "svelte-i18n";

  import { Alert24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import Field from "$lib/components/inputs/Field.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Text from "$lib/components/inputs/Text.svelte";

  import * as api from "$lib/api/saved-searches";
  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    savedSearch?: SavedSearch;
    initialQuery?: string;
    onclose: () => void;
    onsave: (s: SavedSearch) => void;
    ondelete?: (uuid: string) => void;
  }

  let {
    savedSearch,
    initialQuery = "",
    onclose,
    onsave,
    ondelete,
  }: Props = $props();

  // snapshot initial values for editing
  let name = $state(untrack(() => savedSearch?.name ?? ""));
  let query = $state(untrack(() => savedSearch?.query ?? initialQuery));

  let loading = $state(false);
  let error: string | null = $state(null);
  let confirmDelete = $state(false);

  const csrf_token = getCsrfToken() ?? "";

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = null;

    const resp = savedSearch
      ? await api.update(savedSearch.uuid, { name, query }, csrf_token)
      : await api.create({ name, query }, csrf_token);

    loading = false;

    if (resp.error) {
      error = resp.error.message;
      return;
    }
    if (resp.data) onsave(resp.data);
    onclose();
  }

  async function handleDelete() {
    loading = true;
    error = null;

    const resp = await api.destroy(savedSearch!.uuid, csrf_token);

    loading = false;

    if (resp.error) {
      error = resp.error.message;
      return;
    }
    ondelete?.(savedSearch!.uuid);
    onclose();
  }
</script>

<form onsubmit={handleSubmit} autocomplete="off">
  <Flex direction="column" gap={1}>
    <Field title={$_("documents.savedSearches.name")} required>
      <Text
        name="name"
        bind:value={name}
        placeholder={$_("documents.savedSearches.name")}
        autocomplete="off"
        required
        autofocus
      />
    </Field>
    <Field title={$_("documents.savedSearches.query")}>
      <Text
        name="query"
        bind:value={query}
        placeholder={$_("documents.savedSearches.query")}
      />
    </Field>

    {#if error}
      <Tip mode="error">
        {#snippet icon()}<Alert24 />{/snippet}
        {error}
      </Tip>
    {/if}

    <Flex class="buttons">
      <Button type="submit" mode="primary" full disabled={loading}>
        {$_("edit.save")}
      </Button>
      <Button full onclick={onclose} disabled={loading}>
        {$_("edit.cancel")}
      </Button>
    </Flex>

    {#if savedSearch}
      {#if confirmDelete}
        <Flex>
          <Button mode="danger" full onclick={handleDelete} disabled={loading}>
            {$_("documents.savedSearches.confirmDelete")}
          </Button>
          <Button
            full
            onclick={() => (confirmDelete = false)}
            disabled={loading}
          >
            {$_("edit.cancel")}
          </Button>
        </Flex>
      {:else}
        <Button
          ghost
          mode="danger"
          onclick={() => (confirmDelete = true)}
          disabled={loading}
        >
          {$_("documents.savedSearches.delete")}
        </Button>
      {/if}
    {/if}
  </Flex>
</form>

<style>
  form {
    width: 100%;
  }
</style>
