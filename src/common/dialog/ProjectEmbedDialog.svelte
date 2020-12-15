<script>
  import Button from "@/common/Button";
  import AppearanceCustomizer from "@/common/AppearanceCustomizer";
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

  // let appearanceOptions = [
  //   {
  //     type: "toggle",
  //     title: "Sidebar behavior",
  //     values: [
  //       [
  //         "Responsive (default)",
  //         "Show sidebar automatically on large screens and hide on mobile devices. In embed mode, the sidebar will be hidden",
  //       ],
  //       ["Hidden", "Hide the sidebar by default"],
  //       ["Visible", "Show the sidebar by default"],
  //     ],
  //     selected: 0,
  //   },
  // ];
</script>

<style lang="scss">
</style>

{#if project != null}
  <div>
    <div class="mcontent">
      <h1>Share “{project.title}”</h1>

      <!-- TODO: appearance options -->
      <!-- <AppearanceCustomizer
        options={appearanceOptions}
        on:change={() => (appearanceOptions = appearanceOptions)} /> -->

      <ShareOptions
        embedDescription="Copy the HTML code to embed this document within an article
        or post:"
        {embedCode}
        {errorOccurred}
        linkText={linkUrl}
        tweetText={`${project.title} ${linkUrl}`} />
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
