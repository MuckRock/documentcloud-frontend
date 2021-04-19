<script>
  import { modification } from "@/viewer/modification/modification";
  import Documents from "@/pages/app/Documents";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {},
  });

  function handlePick(event) {
    modification.insertDocument = event.detail;
    emit.dismiss(document);
  }
</script>

<style lang="scss">
  .documents {
    padding: 0 10px;
  }
</style>

<div>
  <div class="mcontent">
    <div class="documents">
      <Documents dialog={true} embed={true} on:pick={handlePick} />
    </div>
  </div>
</div>
