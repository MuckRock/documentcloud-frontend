<script>
  import BoundedNumberInput from "@/common/BoundedNumberInput";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { doc } from "@/viewer/document";
  import { _ } from 'svelte-i18n';

  let selectedPage = null;

  let page = "visible";
  let anotherNumber = 1;

  $: selectedPage =
    page == "visible" ? doc.visiblePageNumber - 1 : anotherNumber - 1;
  $: visiblePage = selectedPage + 1;
  $: pageUrl = $layout.embedDocument.pageUrl(visiblePage);
  $: enhanceSrc = `${process.env.APP_URL}embed/enhance.js`;

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

<style lang="scss">
  .another {
    margin: 5px 0;
  }
</style>

<h1>{$_("dialogPageEmbedDialog.embedPage", {values: {title: $layout.embedDocument.title}})}</h1>
{$_("dialogPageEmbedDialog")}
<select bind:value={page}>
  <option value="visible">
  {$_("dialogPageEmbedDialog.page", {values: {n: doc.visiblePageNumber}})}
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
