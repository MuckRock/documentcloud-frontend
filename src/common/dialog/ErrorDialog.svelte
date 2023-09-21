<script>
  import ErrorData from "@/common/ErrorData.svelte";

  export let error;
  export let refresh = false;
</script>

<div>
  <div class="mcontent">
    <ErrorData {error} {refresh} on:dismiss />
  </div>
</div>
