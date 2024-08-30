<script lang="ts">
  import { createEventDispatcher, onMount, getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import { pageHashUrl } from "$lib/api/documents";
  import type { ViewerMode } from "$lib/api/types";
  import { replaceState } from "$app/navigation";

  export let page_number: number;
  export let mode: ViewerMode = "document";
  export let wide = false;
  export let tall = false;
  export let track: boolean | "once" = false;

  const dispatch = createEventDispatcher();

  const currentPage: Writable<number> = getContext("currentPage");

  let io: IntersectionObserver;
  let container: HTMLElement;
  let visible: boolean;

  $: id = pageHashUrl(page_number).replace("#", "");
  $: href = `?mode=${mode}` + pageHashUrl(page_number);

  function watch(el: HTMLElement, once = false): IntersectionObserver {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // update state
            visible = true;
            dispatch("visible");

            if (once) {
              observer.unobserve(el);
            }
          } else {
            visible = false;
          }

          const { boundingClientRect, rootBounds } = entry;

          if (
            boundingClientRect.top > rootBounds.top &&
            boundingClientRect.top < rootBounds.height / 2 &&
            currentPage // in case context is missing
          ) {
            $currentPage = page_number;
            replaceState(pageHashUrl($currentPage), {});
          }
        });
      },
      {
        // [0, 0.1, 0.2, ...]
        threshold: Array(11)
          .fill(undefined)
          .map((n, i) => i / 10),
      },
    );

    io.observe(el);

    return io;
  }

  function unwatch(io: IntersectionObserver, el: HTMLElement) {
    io?.unobserve(el);
  }

  onMount(() => {
    if (track) {
      io = watch(container, track === "once");
    }

    return () => {
      unwatch(io, container);
    };
  });
</script>

<div {id} bind:this={container} class="page" class:wide class:tall>
  <header>
    <h4>
      <a {href}>
        {$_("documents.pageAbbrev")}
        {page_number}
      </a>
    </h4>

    <slot name="title" />

    {#if $$slots.actions}
      <div class="actions">
        <slot name="actions" />
      </div>
    {/if}
  </header>
  <slot {id} {href} {visible} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: center;
    gap: var(--font-md, 1rem);
    position: relative;
    padding: 0 1rem;
    margin: 0.75rem 0 0;
    max-width: 100%;
    scroll-margin-top: 6rem;
  }

  .page.wide {
    width: 100%;
  }

  h4,
  h4 a {
    color: var(--gray-4, #5c717c);
    position: sticky;
    left: 1rem;
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }

  header {
    display: flex;
    height: var(--font-md, 1rem);
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }
</style>
