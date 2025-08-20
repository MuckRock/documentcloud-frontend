<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Comment16, Question16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";
  import { getViewerHref } from "$lib/utils/viewer";

  let width: number;
</script>

<div class="toolbar" bind:clientWidth={width}>
  <Flex align="center">
    <h3 class="title">
      <Comment16 />
      {$_("annotate.title")}
    </h3>
    <Tooltip caption={$_("annotate.instructions")}>
      <Question16 fill="var(--blue-3)" />
    </Tooltip>
  </Flex>
  <Button
    size="small"
    mode="primary"
    href={getViewerHref({ mode: "document" })}
  >
    {$_("dialog.done")}
  </Button>
</div>

<style>
  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
  }

  .title {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
</style>
