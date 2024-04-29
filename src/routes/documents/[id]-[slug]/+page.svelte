<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import TextPage from "$lib/components/documents/TextPage.svelte";

  export let data;

  const modes = new Map([
    ["document", "Document"],
    ["text", "Text"],
    ["thumbnails", "Thumbnails"],
    ["notes", "Notes"],
  ]);

  $: mode = modes.has(data.mode) ? data.mode : "document";
  $: text = data.text;

  function setMode(e) {
    const mode = e.target.value;
    const u = new URL($page.url);

    u.searchParams.set("mode", mode);

    goto(u);
  }
</script>

<ContentLayout>
  {#if mode === "text"}
    {#await text then { pages }}
      {#each pages as { page, contents }}
        <TextPage {page} {contents} />
      {/each}
    {/await}
  {/if}

  <PageToolbar slot="footer">
    <select name="mode" slot="left" value={mode} on:change={setMode}>
      {#each modes.entries() as [value, name]}
        <option {value}>{name}</option>
      {/each}
    </select>
  </PageToolbar>
</ContentLayout>
