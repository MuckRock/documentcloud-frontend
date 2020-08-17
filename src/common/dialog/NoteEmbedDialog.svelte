<script>
  import BoundedNumberInput from "@/common/BoundedNumberInput";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { doc } from "@/viewer/document";
  import { pageImageUrl, textUrl } from "@/api/viewer";

  const IMAGE_WIDTHS = process.env.IMAGE_WIDTHS.split(",")
    .map(x => x.split(":"))
    .map(x => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const LARGE_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    x => x[0][1] == "large"
  )[0];

  $: noteUrl = $layout.embedDocument.noteUrl($layout.embedNote);
  $: loaderSrc = `${process.env.APP_URL}notes/loader.js`;
  $: annotationSrc = `${$layout.embedDocument.fakeNoteUrl(
    $layout.embedNote
  )}.js`;
  $: annotationHtmlSrc = $layout.embedDocument.fakeNoteUrl($layout.embedNote);

  $: embedCode = `<div id="DC-note-${$layout.embedNote.id}" class="DC-embed DC-embed-note DC-note-container"></div>
\u003Cscript src="${loaderSrc}">\u003C/script>
\u003Cscript>
  dc.embed.loadNote('${annotationSrc}');
\u003C/script>
<noscript>
  <a href="${annotationHtmlSrc}">View note</a>
</noscript>
`;
</script>

<h1>Embed a note of “{$layout.embedDocument.title}”</h1>

<ShareOptions
  embedDescription={'Copy the HTML code to embed this note within an article or post:'}
  {embedCode}
  embedAction={() => {
    const script = document.createElement('script');
    script.src = loaderSrc;
    script.addEventListener('load', () => {
      window['dc'].embed.loadNote(annotationSrc);
    });
    document.body.appendChild(script);
  }}
  linkText={noteUrl}
  tweetText={`${$layout.embedNote.title} (from ${$layout.embedDocument.title}) ${noteUrl}`} />
