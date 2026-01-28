<script lang="ts">
  import type { Document, Maybe } from "$lib/api/types";
  import type { Snippet } from "svelte";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";

  import ResultsList from "../ResultsList.svelte";
  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "../VisibleFields.svelte";

  interface Props {
    results?: Document[];
    count?: Maybe<number>;
    next?: string | null;
    auto?: boolean;
    preload?: "hover" | "tap";
    start?: Snippet;
    end?: Snippet;
  }

  let {
    results = [],
    count = undefined,
    next = null,
    auto = false,
    preload = "hover",
    start,
    end,
  }: Props = $props();

  // Set up contexts needed by ResultsList
  setContext("embed", false);
  setVisibleFieldsContext(writable(defaultVisibleFields));
</script>

<ResultsList {results} {count} {next} {auto} {preload} {start} {end} />
