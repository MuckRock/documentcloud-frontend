<script>
  import { createEventDispatcher } from "svelte";
  import { modification } from "@/viewer/modification/modification.js";
  import Documents from "@/pages/app/Documents.svelte";
  import emitter from "@/emit.js";

  const dispatch = createEventDispatcher();

  const emit = emitter({
    dismiss() {},
  });

  function handlePick(event) {
    modification.insertDocument = event.detail;
    emit.dismiss(document);
    // dispatch('dismiss', {})
  }
</script>

<div class="mcontent">
  <div class="documents">
    <Documents dialog={true} embed={true} on:pick={handlePick} />
  </div>
</div>

<style>
  .documents {
    padding: 0 10px;
  }
</style>
