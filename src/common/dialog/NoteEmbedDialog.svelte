<script>
  import { _ } from "svelte-i18n";

  import ShareOptions from "@/common/ShareOptions.svelte";

  import { layout } from "@/viewer/layout.js";
  import { getEmbed } from "@/api/embed.js";

  import { APP_URL } from "../../config/config.js";

  $: noteUrl = $layout.embedDocument.noteUrl($layout.embedNote);
  $: loaderSrc = `${APP_URL}notes/loader.js`;
  $: annotationSrc = `${$layout.embedDocument.fakeNoteUrl(
    $layout.embedNote,
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

<h1>
  {$_("dialogNoteEmbedDialog.embedNote", {
    values: { title: $layout.embedDocument.title },
  })}
</h1>

<ShareOptions
  embedDescription="{$_('dialogNoteEmbedDialog.embedDesc')}}"
  {embedCode}
  {errorOccurred}
  embedAction={() => {
    const script = document.createElement("script");
    script.src = loaderSrc;
    script.addEventListener("load", () => {
      window["dc"].embed.loadNote(annotationSrc);
    });
    document.body.appendChild(script);
  }}
  linkText={noteUrl}
  tweetText={`${$layout.embedNote.title} (from ${$layout.embedDocument.title}) ${noteUrl}`}
/>
