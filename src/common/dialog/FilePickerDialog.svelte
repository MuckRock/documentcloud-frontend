<script>
  import Documents from "@/pages/app/Documents";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {},
  });

  function handlePick(event) {
    const document = event.detail;
    emit.dismiss();
  }
</script>

<div>
  <div class="mcontent">
    <Documents dialog={true} embed={true} on:pick={handlePick} />
  </div>
</div>
