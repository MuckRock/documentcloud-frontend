<script>
  import ErrorData from "@/common/ErrorData";

  export let error;
  export let refresh = false;
</script>

<div>
  <div class="mcontent">
    <ErrorData {error} {refresh} on:dismiss />
  </div>
</div>
