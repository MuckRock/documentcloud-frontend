<script>
  import Button from "@/common/Button";
  import { hideEditSections } from "@/viewer/layout";

  let pendingSections = [];

  function addSection() {
    pendingSections = [...pendingSections, { page: "", title: "" }];
  }
</script>

<div>
  <div class="mcontent">
    <h1>Edit Sections</h1>
    <p>Add sections to organize your document with a table of contents.</p>
    {#each pendingSections as section}
      <div class="section">
        <span>p.</span>
        <input type="text" placeholder="#" bind:value={section.page} />
        <input type="text" placeholder="Title" bind:value={section.title} />
      </div>
    {/each}
    <div class="buttonpadded">
      <Button on:click={addSection}>+ Add section</Button>
      <Button secondary={true} on:click={hideEditSections}>Cancel</Button>
    </div>
  </div>
</div>
