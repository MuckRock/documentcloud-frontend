<script>
  import Button from "@/common/Button";
  import ShareOptions from "@/common/ShareOptions";

  import emitter from "@/emit";
  import { getEmbed } from "@/api/embed";
  import { queryBuilder } from "@/util/url";
  import { layout } from "@/manager/layout";

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

<style lang="scss">
</style>

{#if project != null}
  <div>
    <div class="mcontent">
      <h1>Share “{project.title}”</h1>

      <ShareOptions
        embedDescription="Copy the HTML code to embed this document within an article
        or post:"
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
      <h1>Invalid project</h1>
      <p>Cannot embed this project, as it does not appear to exist.</p>
      <div class="buttonpadded">
        <Button secondary={true} on:click={emit.dismiss}>Ok</Button>
      </div>
    </div>
  </div>
{/if}
