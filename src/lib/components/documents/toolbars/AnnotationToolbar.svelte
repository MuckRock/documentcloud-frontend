<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Comment16, Question16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Tooltip from "@/common/Tooltip.svelte";
</script>

<PageToolbar>
  <Flex align="center" slot="left">
    <h3 class="title">
      <Comment16 />
      {$_("annotate.title")}
    </h3>
    <Tooltip caption={$_("annotate.instructions")}>
      <Question16 fill="var(--blue-3)" />
    </Tooltip>
  </Flex>
  <Button size="small" slot="right" mode="primary" href="?mode=document">
    {$_("dialog.done")}
  </Button>
</PageToolbar>

<style>
  .title {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }
</style>
