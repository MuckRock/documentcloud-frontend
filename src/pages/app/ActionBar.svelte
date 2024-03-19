<script lang="ts">
  import { _ } from "svelte-i18n";
  import Badge from "../../common/Badge.svelte";
  import Checkbox from "../../common/Checkbox.svelte";
  import Flex from "../../common/Flex.svelte";
  import Tooltip from "../../common/Tooltip.svelte";
  import Dropdown from "../../common/Dropdown.svelte";
  import Paginator from "../../common/Paginator.svelte";

  // Menus
  import EditMenu from "./menus/EditMenu.svelte";
  import ProjectsMenu from "./menus/ProjectsMenu.svelte";
  import AddonsMenu from "./menus/AddonsMenu.svelte";

  let outerHeight = 1000;
  let editVisible = false;

  export let loggedIn: boolean;

  export let data: {
    loading: boolean;
    documents: Array<any>;
  };

  export let selection: {
    checked: boolean;
    indeterminate: boolean;
    editable: boolean;
    onUncheck: () => void;
    onCheck: () => void;
  };

  export let pagination: {
    page: number;
    totalPages?: number;
    totalItems?: number;
    onNext: () => void;
    onPrev: () => void;
    has_next: boolean;
    has_prev: boolean;
  };

  function handleSelectAll({ detail }) {
    if (!detail.indeterminate) selection.onCheck();
  }
</script>

<div class="barcontainer">
  {#if !data.loading}
    <Flex gap={2} align="center" justify="space-between">
      <Flex gap={2} align="center">
        {#if loggedIn}
          <span class="action check scaledown">
            {#if data.documents.length > 0}
              <Checkbox
                on:check={handleSelectAll}
                on:uncheck={selection.onUncheck}
                indeterminate={selection.indeterminate}
                checked={selection.checked}
              />
            {/if}
          </span>

          {#if selection.checked && selection.editable}
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
                caption={selection.editable
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
              <span>
                {$_("actionBar.addOnsMenu")}
                <span class="dropper">▼</span>
              </span>
            </span>
            <AddonsMenu />
          </Dropdown>
        {/if}
      </Flex>
      <Flex gap={2} align="center">
        {#if pagination.totalItems}
          <div class="documents">
            {$_("paginator.document", { values: { n: pagination.totalItems } })}
          </div>
        {/if}
        <span class="narrowhide">
          <Paginator
            page={pagination.page}
            totalPages={pagination.totalPages}
            on:next={pagination.onNext}
            on:previous={pagination.onPrev}
            has_next={pagination.has_next}
            has_previous={pagination.has_prev}
          />
        </span>
      </Flex>
    </Flex>
  {/if}
</div>

<svelte:window bind:outerHeight />

<style lang="scss">
  .barcontainer {
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    padding: 0.75rem 0;
    color: var(--darkgray);

    .nowrap {
      white-space: nowrap;
    }

    .action {
      color: $primary;
      user-select: none;
      cursor: pointer;
      display: inline-block;
      flex: 0 1 auto;
      vertical-align: middle;
      padding: 0 0.125rem;

      &.check {
        transform: translateY(2px);
      }

      &.disabled {
        color: $gray;
        cursor: inherit;
      }

      &.scaledown {
        > :global(*) {
          zoom: 0.8;
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
