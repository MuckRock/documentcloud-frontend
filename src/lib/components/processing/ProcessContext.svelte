<script lang="ts" context="module">
  import type { Run } from "@/addons/types";
  import type { Maybe, Pending } from "@/lib/api/types";
  import { getContext, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  interface ProcessContext {
    documents: Writable<Pending[]>;
    addons: Writable<Run[]>;
  }

  export function getDocuments(): Maybe<Writable<Pending[]>> {
    return getContext<ProcessContext>("processing")?.documents;
  }

  export function getAddons(): Maybe<Writable<Run[]>> {
    return getContext<ProcessContext>("processing")?.addons;
  }
</script>

<script lang="ts">
  export let addons: Writable<Run[]> = writable([]);
  export let documents: Writable<Pending[]> = writable([]);

  // stores we need deeper in the component tree, available via context
  setContext<ProcessContext>("processing", { addons, documents });
</script>

<slot />
