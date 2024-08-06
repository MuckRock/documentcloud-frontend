<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types/orgAndUser";

  import { getContext, setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Hourglass24 } from "svelte-octicons";

  import AddOnDispatch, {
    values,
  } from "$lib/components/forms/AddOnDispatch.svelte";
  import AddOnMeta from "$lib/components/addons/AddOnMeta.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import MainLayout from "$lib/components/layouts/MainLayout.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "$lib/components/documents/ResultsList.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Selection from "$lib/components/inputs/Selection.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";

  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";

  export let data;
  export let form;

  setContext("selected", selected);

  const me: Writable<User> = getContext("me");

  $: addon = data.addon;
  $: query = data.query;
  $: searchResults = data.searchResults;
  $: action = `/add-ons/${addon.repository}/?/dispatch`;

  // todo: disable if not premium
  $: organization =
    typeof $me.organization === "object" ? $me.organization : null;
  $: isPremiumUser = isPremiumOrg(organization);
  $: creditBalance = getCreditBalance(organization) ?? 0;
  $: isPremiumAddon =
    addon?.parameters.categories?.includes("premium") ?? false;
  $: disablePremium = isPremiumAddon && (!isPremiumUser || creditBalance === 0);

  $: console.log(form);

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<MainLayout>
  <div class="addon-dispatch" slot="content">
    <Flex direction="column">
      <AddOnMeta {addon} />
      <div class="form-container card">
        <AddOnDispatch
          {action}
          properties={addon.parameters.properties}
          required={addon.parameters.required}
          eventOptions={addon.parameters.eventOptions}
        >
          <svelte:fragment slot="selection">
            {#await searchResults then results}
              <Selection
                bind:value={$values["selection"]}
                documents={new Set(addon.parameters.documents)}
                resultsCount={results.count}
                {query}
              />
            {/await}
          </svelte:fragment>
        </AddOnDispatch>
      </div>
    </Flex>
    {#if addon.parameters.documents}
      <ContentLayout>
        <PageToolbar slot="header">
          <Search name="q" {query} slot="center" />
        </PageToolbar>
        <svelte:fragment>
          {#await searchResults}
            <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
          {:then search}
            <ResultsList
              results={search.results}
              next={search.next}
              count={search.count}
              auto
            />
          {/await}
        </svelte:fragment>

        <PageToolbar slot="footer">
          <label slot="left" class="select-all">
            <input
              type="checkbox"
              name="select_all"
              checked={$selected.length === $visible.size}
              indeterminate={$selected.length > 0 &&
                $selected.length < $visible.size}
              on:change={selectAll}
            />
            {#if $selected.length > 0}
              {$selected.length.toLocaleString()} {$_("inputs.selected")}
            {:else}
              {$_("inputs.selectAll")}
            {/if}
          </label>

          <svelte:fragment slot="right">
            {#if $visible && $total}
              {$_("inputs.resultsCount", {
                values: { n: $visible.size, total: $total },
              })}
            {/if}
          </svelte:fragment>
        </PageToolbar>
      </ContentLayout>
    {/if}
  </div>
</MainLayout>

<style>
  .addon-dispatch {
    display: grid;
    grid-template-columns: repeat(auto-fit, repeat(1fr, 45rem));
    justify-content: center;
  }
  .form-container {
    margin: 0.75rem;
    padding: 0.75rem;
  }
</style>
