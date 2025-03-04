<script lang="ts" context="module">
  export interface FilterFields {
    access?: string;
    minPages?: number;
    maxPages?: number;
    minDate?: string;
    maxDate?: string;
    projects?: Project[];
    users?: User[];
    orgs?: Org[];
  }

  export const defaultFilters: FilterFields = {
    access: "",
    minPages: undefined,
    maxPages: undefined,
    minDate: undefined,
    maxDate: undefined,
    projects: [],
    users: [],
    orgs: [],
  };
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    ChevronDown16,
    Eye16,
    FileDirectory16,
    Filter16,
    Hash16,
    LinkExternal16,
    Organization16,
    Person16,
  } from "svelte-octicons";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import type { Org, Project, User } from "@/lib/api/types";
  import Button from "../common/Button.svelte";
  import { list as listProjects } from "@/lib/api/projects";
  import { listUsers, listOrgs } from "@/lib/api/accounts";
  import Select from "../inputs/Select.svelte";

  export let filters: FilterFields = defaultFilters;

  async function loadProjects(text: string): Promise<Project[]> {
    const { data, error } = await listProjects({ query: text });
    if (data && !error) {
      return data.results;
    } else if (!data) {
      console.warn("Missing response data");
      return [];
    } else {
      throw new Error(error?.message);
    }
  }

  async function loadUsers(text: string): Promise<User[]> {
    const { data, error } = await listUsers({ name__istartswith: text });
    if (data && !error) {
      return data.results;
    } else if (!data) {
      console.warn("Missing response data");
      return [];
    } else {
      throw new Error(error?.message);
    }
  }

  async function loadOrgs(text: string): Promise<Org[]> {
    const { data, error } = await listOrgs({ name__istartswith: text });
    if (data && !error) {
      return data.results;
    } else if (!data) {
      console.warn("Missing response data");
      return [];
    } else {
      throw new Error(error?.message);
    }
  }
</script>

<Dropdown>
  <SidebarItem slot="anchor">
    <Filter16 slot="start" />
    {$_("documentBrowser.filter.label")}
    <ChevronDown16 slot="end" />
  </SidebarItem>
  <Menu --overflow-y="visible">
    <div class="filters">
      <Select
        items={[
          {
            label: $_("documentBrowser.filter.access.private"),
            value: "private",
          },
          {
            label: $_("documentBrowser.filter.access.public"),
            value: "public",
          },
        ]}
        value={filters.access}
        bind:justValue={filters.access}
        name="access"
        placeholder="Access"
        clearable
      >
        <Eye16 slot="prepend" />
      </Select>
      <Select
        loadOptions={loadUsers}
        bind:value={filters.users}
        name="users"
        placeholder={$_("documentBrowser.filter.users")}
        itemId="id"
        label="name"
        multiple
      >
        <Person16 slot="prepend" />
      </Select>
      <Select
        loadOptions={loadOrgs}
        bind:value={filters.orgs}
        name="orgs"
        placeholder={$_("documentBrowser.filter.orgs")}
        itemId="id"
        label="name"
        multiple
      >
        <Organization16 slot="prepend" />
      </Select>
      <Select
        loadOptions={loadProjects}
        bind:value={filters.projects}
        name="projects"
        placeholder={$_("documentBrowser.filter.projects")}
        itemId="id"
        label="title"
        multiple
      >
        <FileDirectory16 slot="prepend" />
      </Select>
    </div>
    <fieldset class="dates">
      <legend>Date Created</legend>
      <label class="min date">
        {$_("documentBrowser.filter.minDate")}
        <input
          type="date"
          placeholder={$_("documentBrowser.filter.minDate")}
          bind:value={filters.minDate}
          max={filters.maxDate || ""}
        />
      </label>
      <label class="max date">
        {$_("documentBrowser.filter.maxDate")}
        <input
          type="date"
          placeholder={$_("documentBrowser.filter.maxDate")}
          bind:value={filters.maxDate}
          min={filters.minDate || ""}
        />
      </label>
    </fieldset>
    <fieldset class="pageCounts">
      <legend>Page Count</legend>
      <label class="min pages">
        <Hash16 />
        <input
          type="number"
          min="1"
          placeholder={$_("documentBrowser.filter.minPages")}
          bind:value={filters.minPages}
        />
      </label>
      <label class="max pages">
        <Hash16 />
        <input
          type="number"
          min="1"
          placeholder={$_("documentBrowser.filter.maxPages")}
          bind:value={filters.maxPages}
        />
      </label>
    </fieldset>
    <Button ghost mode="primary">
      <LinkExternal16 />
      {$_("documentBrowser.filter.advancedHelp")}
    </Button>
  </Menu>
</Dropdown>

<style>
  :global(.filters .select) {
    font-size: var(--font-sm);
  }
  .filters {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.25rem;
  }
  fieldset {
    margin: 0.25rem;
    padding: 0.5rem 0.5rem;
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
  }
  fieldset legend {
    font-size: var(--font-xs);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: var(--font-semibold);
    color: var(--gray-4);
    padding: 0 0.5rem;
  }
  .pageCounts {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dates {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    & label {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: var(--font-sm);
      font-weight: var(--font-semibold);
      color: var(--gray-4);
    }
    & input {
      font-family: var(--font-sans);
      font-size: var(--font-md);
      box-shadow: none;
      border-radius: 0.5rem;
      border: 1px solid var(--gray-2);
      padding: 0.25rem;
      &::placeholder {
        color: var(--gray-4);
      }
    }
  }
  .pages {
    flex: 1 1 8rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--gray-5);
    fill: var(--gray-4);
    padding: 0.25rem;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    &:hover {
      border-color: var(--gray-3);
    }
    &:active,
    &:focus,
    &:focus-within {
      border-color: var(--blue-3);
      outline: 2px solid var(--blue-3);
    }
    & input {
      flex: 1 1 auto;
      appearance: none;
      border: none;
      background: transparent;
      font-family: var(--font-sans);
      font-size: var(--font-md);
      box-shadow: none;
      &:focus {
        outline: none;
      }
    }
  }
</style>
