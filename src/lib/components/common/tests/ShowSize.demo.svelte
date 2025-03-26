<script lang="ts">
  import Empty from "../Empty.svelte";
  import Error from "../Error.svelte";
  import ShowSize from "../ShowSize.svelte";

  export let size: number;
</script>

<ShowSize {size}>
  <p>{size} items</p>
  <Empty slot="empty">Zero items</Empty>
  <Error slot="oversize">Too many items!</Error>
</ShowSize>
