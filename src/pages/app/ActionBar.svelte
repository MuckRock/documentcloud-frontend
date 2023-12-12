<script>
  import Checkbox from "@/common/Checkbox.svelte";
  import Tooltip from "@/common/Tooltip.svelte";
  import Dropdown from "@/common/Dropdown.svelte";
  import Paginator from "./Paginator.svelte";
  import { _ } from "svelte-i18n";

  // Menus
  import EditMenu from "./menus/EditMenu.svelte";
  import ProjectsMenu from "./menus/ProjectsMenu.svelte";
  import AddonsMenu from "./menus/AddonsMenu.svelte";

  // Stores
  import { layout } from "@/manager/layout.js";
  import { manager, selectAll } from "@/manager/manager.js";
  import { documents, unselectAll } from "@/manager/documents.js";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";

  function handleSelectAll({ detail }) {
    if (!detail.indeterminate) selectAll();
  }

  let outerHeight = 1000;
  let editVisible = false;
</script>

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
            name="edit-menu"
            table={true}
            fixed={outerHeight > 600}
            on:active={(e) => (editVisible = e.detail)}
          >
            <span class="action nowrap" slot="title">
              {$_("actionBar.editMenu")}
              <span class="dropper">▼</span>
            </span>
            <EditMenu visible={editVisible} />
          </Dropdown>
        {:else}
          <span class="action disabled shortpad nowrap">
            <Tooltip
              caption={$layout.selectionEditable
                ? $_("actionBar.selectDocs")
                : $_("actionBar.noPerms")}
            >
              {$_("actionBar.editMenu")}
              <span class="dropper">▼</span>
            </Tooltip>
          </span>
        {/if}
        <Dropdown name="projects-menu" table={true} fixed={outerHeight > 600}>
          <span class="action nowrap" slot="title">
            {$_("actionBar.projectsMenu")}
            <span class="dropper">▼</span>
          </span>
          <ProjectsMenu />
        </Dropdown>
        <Dropdown name="addons-menu" table={true} fixed={outerHeight > 600}>
          <span class="action nowrap" slot="title">
            <span class="badge"> {$_("common.new")}! </span>
            {$_("actionBar.addOnsMenu")}
            <span class="dropper">▼</span>
          </span>
          <AddonsMenu />
        </Dropdown>
      {/if}

      <span class="narrowhide">
        <Paginator />
      </span>
    </div>
  {/if}
</div>

<svelte:window bind:outerHeight />

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

  .badge {
    background-color: $primary;
    color: $menuBg;
    font-size: 12px;
    padding: 0.25em 0.5em;
    border-radius: 50%;
    box-sizing: border-box;
    margin-right: 0.25em;
  }

  @media only screen and (max-width: 720px) {
    .narrowhide {
      display: none;
    }
  }
</style>
