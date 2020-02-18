<script>
  import Checkbox from "@/common/Checkbox";
  import Tooltip from "@/common/Tooltip";
  import Dropdown from "@/common/Dropdown";

  // Menus
  import EditMenu from "./menus/EditMenu";
  import ProjectsMenu from "./menus/ProjectsMenu";

  // Stores
  import { layout } from "@/manager/layout";
  import { manager, selectAll } from "@/manager/manager";
  import { unselectAll } from "@/manager/documents";

  function handleSelectAll({ detail }) {
    if (!detail.indeterminate) selectAll();
  }
</script>

<style lang="scss">
  .barcontainer {
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    padding: 14px 0;

    .bar {
      display: table-row;

      .action {
        font-size: 16px;
        color: $primary;
        padding: 0 25px;
        user-select: none;
        cursor: pointer;
        display: table-cell;
        vertical-align: middle;

        &.check {
          padding-right: 35px;
          cursor: inherit;
          transform: translateY(2px);
        }

        &.disabled {
          color: $gray;
          cursor: inherit;
        }

        &:first-child,
        &.shortpad {
          padding-left: 8px;
        }

        &.scaledown {
          > :global(*) {
            zoom: 0.8;
          }
        }
      }
    }
  }
</style>

<div class="barcontainer">
  {#if !$layout.loading}
    <div class="bar">
      <span class="action check scaledown">
        <Checkbox
          on:check={handleSelectAll}
          on:uncheck={unselectAll}
          indeterminate={$manager.someSelected}
          checked={$layout.hasSelection} />
      </span>

      {#if $layout.hasSelection}
        <Dropdown table={true} fixed={true}>
          <span class="action" slot="title">
            Edit
            <span class="dropper">▼</span>
          </span>
          <EditMenu />
        </Dropdown>
      {:else}
        <span class="action disabled shortpad">
          <Tooltip caption="Select some documents to reveal edit actions">
            Edit
            <span class="dropper">▼</span>
          </Tooltip>
        </span>
      {/if}
      <Dropdown table={true} fixed={true}>
        <span class="action" slot="title">
          Projects
          <span class="dropper">▼</span>
        </span>
        <ProjectsMenu />
      </Dropdown>
      <span class="action disabled">
        <Tooltip caption="Not implemented yet">Analyze</Tooltip>
      </span>
      <span class="action disabled">
        <Tooltip caption="Not implemented yet">Publish</Tooltip>
      </span>
    </div>
  {/if}
</div>
