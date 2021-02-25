<script>
  import BoundedNumberInput from "@/common/BoundedNumberInput";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { doc } from "@/viewer/document";

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

<h1>Embed a page of “{$layout.embedDocument.title}”</h1>
Select the page to embed:
<select bind:value={page}>
  <option value="visible">
    Page
    {doc.visiblePageNumber}
    (currently visible)
  </option>
  <option value="another">Other page</option>
</select>

{#if page == "another"}
  <div class="another">
    Enter the page number to embed:
    <BoundedNumberInput
      min={1}
      max={$layout.embedDocument.pageCount}
      bind:value={anotherNumber}
    />
  </div>
{/if}

<ShareOptions
  embedDescription={"Copy the HTML code to embed this page within an article or post:"}
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
