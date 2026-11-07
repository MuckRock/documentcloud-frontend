<script lang="ts">
  import { _ } from "svelte-i18n";

  import NavItem from "$lib/components/common/NavItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Checkbox from "$lib/components/inputs/Checkbox.svelte";
  import EditActionsToolbar from "$lib/components/toolbars/EditActionsToolbar.svelte";

  import { getViewerState } from "$lib/state/viewer.svelte";
  import type { EditButton } from "$lib/state/edit.svelte";

  const viewer = getViewerState();

  let selectedCount = $derived(viewer.selectedPages.size);
  let selectedPages = $derived([...viewer.selectedPages]);
  let totalCount = $derived(viewer.pages.length);
  let allSelected = $derived(selectedCount === totalCount);
  let label = $derived(
    selectedCount > 0
      ? `${selectedCount} ${$_("inputs.selected")}`
      : $_("inputs.selectAll"),
  );

  function onchange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      viewer.pages.forEach(({ id }) => viewer.selectedPages.add(id));
    } else {
      viewer.selectedPages.clear();
    }
  }

  function onEdit(action: EditButton) {
    switch (action) {
      case "cw":
      case "ccw":
      case "delete":
        viewer.history.edit({ action, pages: selectedPages });
        break;
      case "duplicate":
        viewer.history.edit({
          action,
          pages: selectedPages,
          // insert after the last selected page
          position: viewer.pages.findLast(({ id }) =>
            selectedPages.includes(id),
          )!.id,
        });
    }
  }
</script>

<Flex>
  <NavItem>
    <Checkbox
      {label}
      bind:value={allSelected}
      indeterminate={selectedCount > 0 && selectedCount < totalCount}
      {onchange}
    />
  </NavItem>

  <EditActionsToolbar disabled={selectedCount === 0} mode="bulk" {onEdit} />
</Flex>
