<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { LucideIcon } from "@lucide/svelte";
  import type { EditButton } from "$lib/state/edit.svelte";

  import Flex from "$lib/components/common/Flex.svelte";
  import Button from "$lib/components/common/Button.svelte";

  import {
    ChevronUp,
    ChevronDown,
    RotateCwSquare,
    RotateCcwSquare,
    Copy,
    Trash,
  } from "@lucide/svelte/icons";

  type Mode = "edit" | "bulk";

  const {
    mode,
    first = false,
    last = false,
    disabled: disabledProp = false,
    onEdit,
  }: {
    mode: Mode;
    first?: boolean;
    last?: boolean;
    disabled?: boolean;
    onEdit?: (action: EditButton) => void;
  } = $props();

  const editActions = new Map<EditButton, LucideIcon>([
    ["up", ChevronUp],
    ["down", ChevronDown],
    ["cw", RotateCwSquare],
    ["ccw", RotateCcwSquare],
    ["duplicate", Copy],
    ["delete", Trash],
  ]);

  const modeActions: Record<Mode, (EditButton | true)[]> = {
    edit: ["up", "down", true, "ccw", "cw", true, "duplicate", true, "delete"],
    bulk: ["ccw", "cw", true, "duplicate", true, "delete"],
  };

  const edit = $derived(mode === "edit");
</script>

<Flex align="center" gap={edit ? 0 : 0.25}>
  {#each modeActions[mode] as action}
    {#if action === true}
      <span aria-hidden="true" class="divider"></span>
    {:else}
      {@const Icon = editActions.get(action)}
      {@const mode = action === "delete" ? "danger" : "standard"}
      {@const disabled =
        disabledProp ||
        (action === "up" && first) ||
        (action === "down" && last)}
      <Button
        {disabled}
        {mode}
        size="small"
        ghost
        minW={false}
        aria-label={$_(`editMode.${action}`)}
        onclick={() => onEdit?.(action)}
      >
        <Icon size={edit ? 16 : 20} />
      </Button>
    {/if}
  {/each}
</Flex>

<style>
  .divider {
    display: block;
    width: 1px;
    height: 90%;
    border-left: 1px solid var(--gray-2);
    margin: 0 0.25rem;
  }
</style>
