<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {}
  });
</script>

<div>
  <div class="mcontent">
    <h1>An unexpected error occurred</h1>
    <p>Please try again later.</p>
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>Close</Button>
    </div>
  </div>
</div>
