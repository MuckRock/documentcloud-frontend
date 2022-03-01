<script>
  import Checkbox from "@/common/Checkbox";
  import Tooltip from "@/common/Tooltip";
  import Dropdown from "@/common/Dropdown";
  import Paginator from "./Paginator";
  import { _ } from "svelte-i18n";

  // Menus
  import EditMenu from "./menus/EditMenu";
  import ProjectsMenu from "./menus/ProjectsMenu";
  import AddonsMenu from "./menus/AddonsMenu"

  // Stores
  import { layout } from "@/manager/layout";
  import { manager, selectAll } from "@/manager/manager";
  import { documents, unselectAll } from "@/manager/documents";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { addons } from "@/manager/addons";


  function handleSelectAll({ detail }) {
    if (!detail.indeterminate) selectAll();
  }

  let outerHeight = 1000;
  let editVisible = false;
</script>

<style lang="scss">
  .barcontainer {
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    padding: 14px 0;

    .nowrap {
      white-space: nowrap;
    }

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

  @media only screen and (max-width: $mobileBreak) {
    .narrowhide {
      display: none;
    }
  }
</style>

<div class="barcontainer">
  {#if !$layout.loading}
    <div class="bar">
      {#if $orgsAndUsers.loggedIn}
        <span class="action check scaledown">
          {#if $documents.documents.length > 0}
            <Checkbox
              on:check={handleSelectAll}
              on:uncheck={unselectAll}
              indeterminate={$manager.someSelected}
              checked={$layout.hasSelection}
            />
          {/if}
        </span>

        {#if $layout.hasSelection && $layout.selectionEditable}
          <Dropdown
            table={true}
            fixed={outerHeight > 600}
            on:active={(e) => (editVisible = e.detail)}
          >
            <span class="action" slot="title">
              <span class="nowrap">
                {$_("actionBar.editMenu")}
                <span class="dropper">▼</span>
              </span>
            </span>
            <EditMenu visible={editVisible} />
          </Dropdown>
        {:else}
          <span class="action disabled shortpad">
            <Tooltip
              caption={$layout.selectionEditable
                ? $_("actionBar.selectDocs")
                : $_("actionBar.noPerms")}
            >
              <span class="nowrap">
                {$_("actionBar.editMenu")}
                <span class="dropper">▼</span>
              </span>
            </Tooltip>
          </span>
        {/if}
        <Dropdown table={true} fixed={outerHeight > 600}>
          <span class="action" slot="title">
            <span class="nowrap">
              {$_("actionBar.projectsMenu")}
              <span class="dropper">▼</span>
            </span>
          </span>
          <ProjectsMenu />
        </Dropdown>
        {#if $addons.addons.length > 0}
          <Dropdown table={true} fixed={outerHeight > 600}>
            <span class="action" slot="title">
              <span class="nowrap">
                {$_("actionBar.addOnsMenu")}
                <span class="dropper">▼</span>
              </span>
            </span>
            <AddonsMenu />
          </Dropdown>
        {/if}
      {/if}

      <span class="narrowhide">
        <Paginator />
      </span>
    </div>
  {/if}
</div>

<svelte:window bind:outerHeight />
