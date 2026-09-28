<script lang="ts">
  import type { APIError, Maybe } from "$lib/api/types";
  import type { Attachment } from "svelte/attachments";
  import { _ } from "svelte-i18n";
  import Button from "$lib/components/common/Button.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  interface InfiniteScrollProps {
    search: SearchResultsState<any>;
    onNext?: () => Promise<Maybe<APIError<any>>>;
  }

  let { search, onNext }: InfiniteScrollProps = $props();

  let error = $derived(search.error);
  let onNextFn = $derived(onNext ?? search.loadNext);
  let auto = $state(true);

  const handleInfiniteScroll: Attachment = (trigger) => {
    const observer = new IntersectionObserver(async ([entry]) => {
      if (entry?.isIntersecting && auto) {
        error = await onNextFn();
        if (error) {
          // don't retry if there's an error
          auto = false;
        }
      }
    });

    observer.observe(trigger);

    return () => observer.disconnect();
  };
</script>

<div data-testid="scroll-trigger" {@attach handleInfiniteScroll}>
  {#if search.loading && search.visible.size > 0}
    {$_("common.loading")}
  {:else if !auto && search.next}
    <Button
      ghost
      mode="primary"
      disabled={search.loading}
      onclick={async () => {
        error = await onNextFn();
      }}
    >
      {$_("documents.more")}
    </Button>
  {/if}

  {#if error}
    <p class="error">{error.message}</p>
    <p class="error">{$_("documents.retry")}</p>
  {/if}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 1rem;
  }

  .error {
    text-align: center;
    color: var(--error, red);
  }
</style>
