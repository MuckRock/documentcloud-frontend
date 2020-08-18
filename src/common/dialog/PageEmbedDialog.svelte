<script>
  import BoundedNumberInput from "@/common/BoundedNumberInput";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { doc } from "@/viewer/document";
  import { pageImageUrl, textUrl } from "@/api/viewer";

  let selectedPage = null;

  const IMAGE_WIDTHS = process.env.IMAGE_WIDTHS.split(",")
    .map(x => x.split(":"))
    .map(x => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const LARGE_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    x => x[0][1] == "large"
  )[0];

  let page = "visible";
  let anotherNumber = 1;

  $: selectedPage =
    page == "visible" ? doc.visiblePageNumber - 1 : anotherNumber - 1;
  $: visiblePage = selectedPage + 1;
  $: pageUrl = $layout.embedDocument.pageUrl(visiblePage);
  $: enhanceSrc = `${process.env.APP_URL}embed/enhance.js`;

  let embedCode = null;

  $: {
    if (pageUrl != null) {
      getEmbed(pageUrl).then(({ html }) => (embedCode = html));
    }
  }

  //   $: embedCode = `<div class="DC-embed" style="font-family: Source Sans Pro, Avenir Next, Avenir, Helvetica Neue, Helvetica, Arial, sans-serif; max-width: 600px; background: rgb(244, 244, 244); padding: 18px 20px; box-sizing: border-box; border: solid 1px gainsboro; border-radius: 3px">
  //   <div style="font-size:14px;line-height:18px;">
  //     Page ${visiblePage} of <a class="DC-embed-resource" style="color: #5a76a0; text-decoration: underline;" href="${pageUrl}" title="View entire ${
  //     $layout.embedDocument.title
  //   } on DocumentCloud in new window or tab" target="_blank"> ${
  //     $layout.embedDocument.title
  //   }</a>
  //   </div>
  //   <img src="${pageImageUrl(
  //     $layout.embedDocument,
  //     selectedPage,
  //     LARGE_WIDTH
  //   )}" alt="Page ${visiblePage} of ${
  //     $layout.embedDocument.title
  //   }" style="max-width:100%;height:auto;margin:0.5em 0;border:1px solid #ccc;-webkit-box-sizing:border-box;box-sizing:border-box;clear:both" />
  //   <div style="font-size:14px;line-height:18px;text-align:center">
  //     Contributed to <a href="${
  //       process.env.APP_URL
  //     }" title="Go to DocumentCloud in new window or tab" target="_blank" style="color: #5a76a0; text-decoration: underline; font-weight:700;font-family:Gotham,inherit,sans-serif;color:inherit;text-decoration:none">DocumentCloud</a> by ${
  //     $layout.embedDocument.userOrgString
  //   } &bull; <a style="color: #5a76a0; text-decoration: underline;" href="${pageUrl}" title="View entire ${
  //     $layout.embedDocument.title
  //   } on DocumentCloud in new window or tab" target="_blank">View document</a> or <a style="color: #5a76a0; text-decoration: underline;" href="${textUrl(
  //     $layout.embedDocument,
  //     selectedPage
  //   )}" title="Read the text of page ${visiblePage} of ${
  //     $layout.embedDocument.title
  //   } on DocumentCloud in new window or tab" target="_blank">read text</a>
  //   </div>
  // </div>
  // \u003Cscript src="${enhanceSrc}">\u003C/script>
  // `;
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
    Page {doc.visiblePageNumber} (currently visible)
  </option>
  <option value="another">Other page</option>
</select>

{#if page == 'another'}
  <div class="another">
    Enter the page number to embed:
    <BoundedNumberInput
      min={1}
      max={$layout.embedDocument.pageCount}
      bind:value={anotherNumber} />
  </div>
{/if}

<ShareOptions
  embedDescription={'Copy the HTML code to embed this page within an article or post:'}
  {embedCode}
  embedAction={() => {
    const script = document.createElement('script');
    script.src = enhanceSrc;
    document.body.appendChild(script);
  }}
  linkText={pageUrl}
  tweetText={`Page ${visiblePage} of ${$layout.embedDocument.title} ${pageUrl}`} />
