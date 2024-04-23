<script>
  import { _ } from "svelte-i18n";

  import BoundedNumberInput from "@/common/BoundedNumberInput.svelte";
  import ShareOptions from "@/common/ShareOptions.svelte";
  import { layout } from "@/viewer/layout.js";
  import { getEmbed } from "@/api/embed.js";
  import { doc } from "@/viewer/document.js";

  import { APP_URL } from "../../config/config.js";

  let selectedPage = null;

  let page = "visible";
  let anotherNumber = 1;

  $: selectedPage =
    page == "visible" ? doc.visiblePageNumber - 1 : anotherNumber - 1;
  $: visiblePage = selectedPage + 1;
  $: pageUrl = $layout.embedDocument.pageUrl(visiblePage);
  $: enhanceSrc = `${APP_URL}embed/enhance.js`;

  let embedCode = null;
  let errorOccurred = false;

  $: {
    if (pageUrl != null) {
      getEmbed(pageUrl)
        .then(({ html }) => (embedCode = html))
        .catch((e) => {
          console.error(e);
          errorOccurred = true;
        });
    }
  }
</script>

<h1>
  {$_("dialogPageEmbedDialog.embedPage", {
    values: { title: $layout.embedDocument.title },
  })}
</h1>
{$_("dialogPageEmbedDialog.selectPage")}
<select bind:value={page}>
  <option value="visible">
    {$_("dialogPageEmbedDialog.page", { values: { n: doc.visiblePageNumber } })}
  </option>
  <option value="another">{$_("dialogPageEmbedDialog.otherPage")}</option>
</select>

{#if page == "another"}
  <div class="another">
    {$_("dialogPageEmbedDialog.enterPageNumber")}
    <BoundedNumberInput
      min={1}
      max={$layout.embedDocument.pageCount}
      bind:value={anotherNumber}
    />
  </div>
{/if}

<ShareOptions
  embedDescription={$_("dialogPageEmbedDialog.embedDesc")}
  {embedCode}
  {errorOccurred}
  embedAction={() => {
    const script = document.createElement("script");
    script.src = enhanceSrc;
    document.body.appendChild(script);
  }}
  linkText={pageUrl}
  tweetText={`Page ${visiblePage} of ${$layout.embedDocument.title} ${pageUrl}`}
/>

<style lang="scss">
  .another {
    margin: 5px 0;
  }
</style>
