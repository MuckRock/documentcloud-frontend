<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { createMailkey, destroyMailkey } from "@/api/orgAndUser";
  import { _ } from "svelte-i18n";

  const emit = emitter({
    dismiss() {},
  });

  let message = "";

  async function create() {
    const mailkey = await createMailkey();
    message = $_("uploadEmailDialog.createMsg", {values: { mailkey: mailkey }});
  }

  async function destroy() {
    await destroyMailkey();
    message = $_("uploadEmailDialog.destroyMsg");
  }


</script>

<style lang="scss">
  .message :global(a) {
    text-decoration: underline;
    color: #5a76a0;
    &:hover {
      filter: brightness(85%);
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>{$_("uploadEmailDialog.uploadEmailAddress")}</h1>
    <p>{$_("uploadEmailDialog.bodyText")}</p>
    {#if message}
      <p class="message">
        {@html message }
      </p>
    {/if}
    <div class="buttonpadded">
      <Button on:click={create}>
        {$_("dialog.create")}
      </Button>
      <Button danger={true} on:click={destroy}>
        {$_("dialog.delete")}
      </Button>
      <Button secondary={true} on:click={emit.dismiss}>
        {$_("dialog.cancel")}
      </Button>
    </div>
  </div>
</div>
