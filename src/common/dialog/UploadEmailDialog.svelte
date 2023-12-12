<script>
  import Button from "@/common/Button.svelte";
  import emitter from "@/emit.js";
  import { createMailkey, destroyMailkey } from "@/api/orgAndUser.js";
  import { _ } from "svelte-i18n";

  const emit = emitter({
    dismiss() {},
  });

  let message = "";

  async function create() {
    const mailkey = await createMailkey();
    message = $_("uploadEmailDialog.createMsg", {
      values: { mailkey: mailkey },
    });
  }

  async function destroy() {
    await destroyMailkey();
    message = $_("uploadEmailDialog.destroyMsg");
  }
</script>

<div>
  <div class="mcontent">
    <h1>{$_("uploadEmailDialog.uploadEmailAddress")}</h1>
    <p>{@html $_("uploadEmailDialog.bodyText")}</p>
    {#if message}
      <p>
        {@html message}
      </p>
    {/if}
    <div class="buttonpadded">
      <Button on:click={create}>
        {$_("dialog.create")}
      </Button>
      <Button danger={true} on:click={destroy}>
        {$_("uploadEmailDialog.disable")}
      </Button>
      <Button secondary={true} on:click={emit.dismiss}>
        {$_("dialog.cancel")}
      </Button>
    </div>
  </div>
</div>

<style lang="scss">
  p :global(a) {
    text-decoration: underline;
    color: #5a76a0;
    &:hover {
      filter: brightness(85%);
    }
  }
</style>
