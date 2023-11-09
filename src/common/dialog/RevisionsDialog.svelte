<script lang="ts">
  import Button from "../../common/Button.svelte";
  import type { Revision } from "../RevisionIcon.svelte";

  export let revisions: Revision[];
</script>

<table>
  {#each revisions as revision}
    <tr>
      <td>{revision.version}</td>
      <td>{revision.comment}</td>
      <td><Button href={revision.url} download>Download</Button></td>
    </tr>
  {/each}
</table>
