<!-- @component
Input for a single key/value pair or tag (where `key` is `_tag`).
This uses `svelecte` to let users more easily choose existing keys.
-->
<script module lang="ts">
  export interface Result {
    keys?: string[];
    key?: string | null;
    value?: string;
    clear?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { _ } from "svelte-i18n";
  import { CheckCircle16, PlusCircle16, Trash16 } from "svelte-octicons";
  import Svelecte from "svelecte";

  import Button from "../common/Button.svelte";

  interface Props {
    keys?: string[];
    key?: string | null;
    value?: string;
    add?: boolean;
    disabled?: boolean;
    onadd?: ({ key, value }) => Promise<Result>;
    ondelete?: ({ key, value }) => Promise<Result>;
    onedit?: ({ key, value, previous }) => Promise<Result>;
  }

  const DEFAULT_KEYS = ["_tag"];

  let {
    keys = DEFAULT_KEYS,
    key = null,
    value = "",
    add = false,
    disabled = false,
    onadd,
    ondelete,
    onedit,
  }: Props = $props();

  let edited: boolean = $state(false);
  let previous: { key?: string | null; value?: string } = $state({
    key: untrack(() => key),
    value: untrack(() => value),
  });

  let options = $derived.by(() =>
    new Set([...keys, ...DEFAULT_KEYS])
      .values()
      .map((key) => {
        const label = key === "_tag" ? $_("data.tag") : key;
        return { value: key, label };
      })
      .filter((opt) => Boolean(opt.value))
      .toArray(),
  );

  $effect.pre(() => {
    // always include _tag
    if (!keys) keys = DEFAULT_KEYS;
    if (!keys.includes("_tag")) {
      keys = [...keys, "_tag"];
    }
  });

  export function clear() {
    key = "";
    value = "";
  }

  function setKey({ value }) {
    previous.key = key;
    key = value;
    edited = true;
  }

  async function handleAdd() {
    disabled = true;

    if (!onadd) return;

    const result = await onadd({ key, value });

    if (result.keys) {
      keys = result.keys;
    }

    if (result.key) {
      key = result.key;
    }

    if (result.value) {
      value = result.value;
    }

    if (result.clear) clear();

    disabled = false;
    edited = false;
  }

  async function handleEdit() {
    disabled = true;

    if (!onedit) return;

    const result = await onedit({ key, value, previous });

    if (result.keys) {
      keys = result.keys;
    }

    if (result.key) {
      key = result.key;
      previous.key = result.key;
    }

    if (result.value) {
      value = result.value;
      previous.value = value;
    }

    if (result.clear) clear();

    disabled = false;
    edited = false;
  }

  async function handleDelete() {
    disabled = true;

    await ondelete?.({ key, value });

    disabled = false;
  }
</script>

<tr class="kv">
  <td class="key">
    <Svelecte
      {options}
      name="key"
      value={key || null}
      valueField="value"
      labelField="label"
      placeholder={$_("data.newkey")}
      class="elevated"
      creatable
      onChange={setKey}
      {disabled}
    />
  </td>
  <td class="value">
    <label>
      <span class="sr-only">{$_("data.value")}</span>
      <input
        class="value"
        type="text"
        name="value"
        placeholder={$_("data.value")}
        bind:value
        oninput={() => (edited = true)}
        {disabled}
      />
    </label>
  </td>
  <td class="action">
    {#if add}
      <Button
        ghost
        mode="primary"
        title={$_("data.update")}
        minW={false}
        value="add"
        disabled={!key || !value || !onadd || disabled}
        on:click={handleAdd}
      >
        <PlusCircle16 />
      </Button>
    {:else}
      <Button
        ghost
        minW={false}
        mode="primary"
        disabled={!edited || !onedit || !value.trim() || disabled}
        title={$_("dialog.update")}
        value="edit"
        on:click={handleEdit}
      >
        <CheckCircle16 />
      </Button>

      <Button
        ghost
        mode="danger"
        title={$_("data.delete")}
        minW={false}
        value="delete"
        disabled={!ondelete || disabled}
        on:click={handleDelete}
        --fill="var(--caution)"
        --background="var(--orange-2)"
      >
        <Trash16 />
      </Button>
    {/if}
  </td>
</tr>

<style>
  td.key {
    --sv-bg: var(--white, #fff);
    --sv-border: 0.25px solid var(--gray-3, #99a8b3);
    --sv-border-radius: 0.25rem;
    --sv-active-border: 0.25px solid var(--blue-3, #4294f0);
    --sv-min-height: 2.65rem;
    --sv-item-btn-bg-hover: var(--blue-1, #eef3f9);
    --sv-item-selected-bg: var(--blue-3, #4294f0);
    --sv-item-selected-color: var(--white, #fff);
    --sv-dropdown-shadow: var(--shadow-1);
    --sv-dropdown-border: 0.25px solid var(--gray-2, #d8dee2);
    --sv-disabled-color: var(--gray-3);

    min-width: 20ch;
  }

  td.value {
    min-width: 20ch;
  }

  td {
    padding: 0 0.25rem 0.5rem 0;
    --font-size: var(--font-sm);
  }

  input.value {
    display: flex;
    padding: 0.65rem 0.75rem;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    border-radius: 0.25rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: var(--font-md, 1rem);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  input.value::placeholder {
    color: var(--gray-3, #99a8b3);
  }

  input.value:disabled {
    color: var(--gray-3);
  }
</style>
