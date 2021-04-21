<script>
  import BoundedNumberInput from "@/common/BoundedNumberInput";
  import ShareOptions from "@/common/ShareOptions";
  import { layout } from "@/viewer/layout";
  import { getEmbed } from "@/api/embed";
  import { doc } from "@/viewer/document";
  import { pageImageUrl, textUrl } from "@/api/viewer";
  import { _ } from 'svelte-i18n';

  const IMAGE_WIDTHS = process.env.IMAGE_WIDTHS.split(",")
    .map((x) => x.split(":"))
    .map((x) => [parseFloat(x[1]), x[0]])
    .sort((a, b) => a[0] - b[0]);
  const LARGE_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(
    (x) => x[0][1] == "large"
  )[0];

  $: noteUrl = $layout.embedDocument.noteUrl($layout.embedNote);
  $: loaderSrc = `${process.env.APP_URL}notes/loader.js`;
  $: annotationSrc = `${$layout.embedDocument.fakeNoteUrl(
    $layout.embedNote
  )}.js`;

  let embedCode = null;
  let errorOccurred = false;

  $: {
    if (noteUrl != null) {
      getEmbed(noteUrl)
        .then(({ html }) => (embedCode = html))
        .catch((e) => {
          console.error(e);
          errorOccurred = true;
        });
    }
  }
</script>

<h1>{$_("dialogNoteEmbedDialog.embedNote", {values: {title: $layout.embedDocument.title}})}</h1>

<ShareOptions
  embedDescription={$_("dialogNoteEmbedDialog.embedDesc")}}
  {embedCode}
  {errorOccurred}
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
