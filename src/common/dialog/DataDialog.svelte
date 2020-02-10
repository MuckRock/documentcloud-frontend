<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { layout } from "@/manager/layout";
  import { handlePlural } from "@/util/string";

  const emit = emitter({
    dismiss() {}
  });
</script>

<div>
  <div class="mcontent">
    <h1>
      Edit Data for {handlePlural($layout.dataDocuments.length, 'Document', true)}
    </h1>
    <p>Edit key/value pairs describing these documents.</p>

    <div class="inputpadded">
      <input type="text" placeholder="Key" class="key" />
      :
      <input type="text" placeholder="Value" class="value" />
    </div>

    <div class="buttonpadded">
      <Button>Save</Button>
      <Button secondary={true} on:click={emit.dismiss}>Close</Button>
    </div>
  </div>
</div>
