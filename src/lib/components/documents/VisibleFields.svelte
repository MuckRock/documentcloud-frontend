<script lang="ts" context="module">
  export interface VisibleFields {
    fullTitle: boolean;
    meta: boolean;
    thumbnail: boolean;
    projects: boolean;
    description: boolean;
    data: boolean;
  }

  export const defaultVisibleFields: VisibleFields = {
    fullTitle: true,
    meta: true,
    thumbnail: true,
    projects: true,
    description: false,
    data: false,
  };
</script>

<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import FieldLabel from "../common/FieldLabel.svelte";

  const visibleFields = getContext<Writable<VisibleFields>>("visibleFields");

  const labels: Record<keyof VisibleFields, string> = {
    fullTitle: "Full Title",
    meta: "Metadata",
    thumbnail: "Thumbnail",
    description: "Description",
    projects: "Projects",
    data: "Data",
  };
</script>

<form>
  {#each Object.entries($visibleFields) as [key, value], index}
    <label class="visibleField">
      <input type="checkbox" name={key} bind:checked={$visibleFields[key]} />
      <FieldLabel>{labels[key]}</FieldLabel>
    </label>
  {/each}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .visibleField {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
