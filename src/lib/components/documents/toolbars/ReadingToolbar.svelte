<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Comment16,
    EyeClosed16,
    File16,
    Typography16,
    Apps16,
    Note16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Search from "$lib/components/forms/Search.svelte";

  import type { Document, ReadMode, ViewerMode } from "@/lib/api/types";
  import type { Writable } from "svelte/store";
  import { getContext } from "svelte";

  export let document: Document;
  export let query: string = "";
  export let embed: boolean = getContext("embed") ?? false; // are we embedded?

  const mode: Writable<ViewerMode> = getContext("currentMode");

  const readModes: Map<ReadMode, string> = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["grid", $_("mode.grid")],
    ["notes", $_("mode.notes")],
  ]);

  const icons = {
    document: File16,
    text: Typography16,
    grid: Apps16,
    notes: Note16,
  };
</script>

<PageToolbar>
  <div class="tabs" role="tablist" slot="left">
    {#each readModes.entries() as [value, name]}
      <Tab active={$mode === value} href="?mode={value}">
        <svelte:component this={icons[value]} />
        {name}
      </Tab>
    {/each}
  </div>
  <Flex justify="end" slot="right">
    <Search name="q" {query} />
    {#if !embed && document.edit_access}
      <Button ghost href="?mode=annotating">
        <Comment16 />
        {$_("mode.annotating")}
      </Button>
      <Button ghost href="?mode=redacting">
        <EyeClosed16 />
        {$_("mode.redacting")}
      </Button>
    {/if}
  </Flex>
</PageToolbar>

<style>
  .tabs {
    display: flex;
    padding: 0 1rem;
  }
</style>
