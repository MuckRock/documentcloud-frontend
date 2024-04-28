<script lang="ts">
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import TextPage from "$lib/components/documents/TextPage.svelte";

  export let data;

  const modes = [
    ["document", "Document"],
    ["text", "Text"],
    ["thumbnails", "Thumbnails"],
    ["notes", "Notes"],
  ];
</script>

<ContentLayout>
  {#await data.text then { pages }}
    {#each pages as { page, contents }}
      <TextPage {page} {contents} />
    {/each}
  {/await}

  <PageToolbar slot="footer">
    <select name="mode" slot="left">
      {#each modes as [value, name]}
        <option {value}>{name}</option>
      {/each}
    </select>
  </PageToolbar>
</ContentLayout>
