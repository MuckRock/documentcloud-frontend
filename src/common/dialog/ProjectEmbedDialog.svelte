<script>
  import Button from "@/common/Button.svelte";
  import ShareOptions from "@/common/ShareOptions.svelte";

  import emitter from "@/emit.js";
  import { getEmbed } from "@/api/embed.js";
  import { queryBuilder } from "@/util/url.js";
  import { layout } from "@/manager/layout.js";
  import { _ } from "svelte-i18n";

  const emit = emitter({
    dismiss() {},
  });

  $: project = $layout.projectEdit;

  $: embedUrl =
    project == null
      ? null
      : queryBuilder(project.embedUrl, {
          // TODO: add customize options
        });
  $: linkUrl = embedUrl;
  let embedCode = null;
  let errorOccurred = false;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl)
        .then(({ html }) => (embedCode = html))
        .catch((e) => {
          console.error(e);
          errorOccurred = true;
        });
    }
  }
</script>

{#if project != null}
  <div>
    <div class="mcontent">
      <h1>
        {$_("dialogProjectEmbedDialog.share", {
          values: { title: project.title },
        })}
      </h1>

      <ShareOptions
        embedDescription={$_("dialogPageEmbedDialog.embedDesc")}
        {embedCode}
        {errorOccurred}
        linkText={linkUrl}
        showWp={false}
        tweetText={`${project.title} ${linkUrl}`}
      />
    </div>
  </div>
{:else}
  <div>
    <div class="mcontent">
      <h1>{$_("dialogPageEmbedDialog.invalid")}</h1>
      <p>{$_("dialogPageEmbedDialog.cannotEmbed")}</p>
      <div class="buttonpadded">
        <Button secondary={true} on:click={emit.dismiss}>
          {$_("dialog.ok")}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
</style>
