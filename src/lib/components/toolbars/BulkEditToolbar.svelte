<script lang="ts">
  import { _ } from "svelte-i18n";

  import NavItem from "$lib/components/common/NavItem.svelte";
  import Checkbox from "$lib/components/inputs/Checkbox.svelte";

  import { getViewerState } from "$lib/state/viewer.svelte";

  const viewer = getViewerState();

  let selectedCount = $derived(viewer.selectedPages.size);
  let totalCount = $derived(viewer.pageSizes.length);
  let allSelected = $derived(selectedCount === totalCount);
  let label = $derived(
    selectedCount > 0
      ? `${selectedCount} ${$_("inputs.selected")}`
      : $_("inputs.selectAll"),
  );

  function onchange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      viewer.pageSizes.forEach((_, i) => viewer.selectedPages.add(i + 1));
    } else {
      viewer.selectedPages.clear();
    }
  }
</script>

<NavItem>
  <Checkbox
    {label}
    bind:value={allSelected}
    indeterminate={selectedCount > 0 && selectedCount < totalCount}
    {onchange}
  />
</NavItem>
