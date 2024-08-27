<script lang="ts">
  import { _ } from "svelte-i18n";
  import { File16, Typography16, Apps16, Note16 } from "svelte-octicons";
  import Flex from "../common/Flex.svelte";
  import Tab from "../common/Tab.svelte";
  import type { ViewerMode } from "@/lib/api/types";

  export let mode: ViewerMode;

  const modes: Map<ViewerMode, string> = new Map([
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

<div class="container">
  <Flex gap={0} role="tablist">
    {#each modes.entries() as [value, name]}
      <Tab
        active={mode === value}
        on:click={() => {
          mode = value;
        }}
      >
        <svelte:component this={icons[value]} />
        {name}
      </Tab>
    {/each}
  </Flex>
</div>

<style>
  .container {
    padding: 0 1rem;
  }
</style>
