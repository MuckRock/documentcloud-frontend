<script lang="ts">
  import Empty from "../Empty.svelte";
  import Error from "../Error.svelte";
  import ShowSize from "../ShowSize.svelte";

  export let size: number;
</script>

<ShowSize {size}>
  <p>{size} items</p>
  {#snippet empty()}<Empty>Zero items</Empty>{/snippet}
  {#snippet oversize()}<Error>Too many items!</Error>{/snippet}
</ShowSize>
