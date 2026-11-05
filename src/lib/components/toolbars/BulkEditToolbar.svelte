<script lang="ts">
  import { _ } from "svelte-i18n";

  import NavItem from "$lib/components/common/NavItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Checkbox from "$lib/components/inputs/Checkbox.svelte";
  import EditActionsToolbar from "$lib/components/toolbars/EditActionsToolbar.svelte";

  import { getViewerState } from "$lib/state/viewer.svelte";
  import type { EditAction } from "$lib/utils/editMode";

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

  $inspect(viewer.edits);

  function addEdit(action: EditAction) {
    switch (action) {
      case "cw":
      case "ccw":
      case "delete":
        viewer.edits.push({ action, pages: selectedPages });
        break;
      case "duplicate":
        viewer.edits.push({
          action,
          pages: selectedPages,
          // insert after the most recently selected page
          position: selectedPages.at(-1)!,
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

  <EditActionsToolbar
    disabled={selectedCount === 0}
    mode="bulk"
    onEdit={addEdit}
  />
</Flex>
