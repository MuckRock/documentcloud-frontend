<!-- @component
One pending document. This is just for display. 
All loading and invalidation logic lives in `Documents.svelte`.
-->
<script lang="ts">
  import type { Document, Pending } from "$lib/api/types";

  import { Hourglass16, IssueReopened16, XCircle16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let status: Pending;
  export let document: Document;

  $: stalled = status.pages === null;
  $: progress = get_progress(status);

  function get_progress(status: Pending): number {
    const { texts, images, text_positions, pages } = status;
    if (pages === null) return 0;

    const remaining = (texts + images + text_positions) / 3;

    return (pages - remaining) / pages;
  }
</script>

<div class="pending" class:stalled>
  <Flex direction="column" gap={0}>
    <SidebarItem>
      <Hourglass16 slot="start" />
      {document?.title || "..."}
      <Flex slot="end">
        <Button ghost minW={false} mode="primary"><IssueReopened16 /></Button>
        <Button ghost minW={false} mode="danger"><XCircle16 /></Button>
      </Flex>
    </SidebarItem>
    <progress value={progress} />
  </Flex>
</div>
