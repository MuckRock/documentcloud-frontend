<!-- @component
Input for a single key/value pair or tag (where `key` is `_tag`).
This uses `svelecte` to let users more easily choose existing keys.
-->
<script lang="ts">
  import { createBubbler } from "svelte/legacy";

  const bubble = createBubbler();
  import { _ } from "svelte-i18n";
  import { PlusCircle16, Trash16 } from "svelte-octicons";
  import Svelecte from "svelecte";

  import Button from "../common/Button.svelte";

  interface Props {
    keys?: string[];
    key?: string | undefined;
    value?: string;
    add?: boolean;
    disabled?: boolean;
    onadd?: ({ key, value }) => void;
    ondelete?: ({ key, value }) => void;
  }

  let {
    keys = ["_tag"],
    key = undefined,
    value = "",
    add = false,
    disabled = false,
    onadd,
    ondelete,
  }: Props = $props();

  let options = $derived.by(() =>
    new Set([...keys, "_tag"])
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
    if (!keys) keys = ["_tag"];
    if (!keys.includes("_tag")) {
      keys = [...keys, "_tag"];
    }
  });

  export function clear() {
    key = "";
    value = "";
  }

  function handleChange(event) {
    key = event.detail?.value || event.detail || "";
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
      onChange={handleChange}
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
        onchange={bubble("change")}
        oninput={bubble("input")}
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
        disabled={!key || !value || disabled}
        on:click={() => onadd?.({ key, value })}
      >
        <PlusCircle16 />
      </Button>
    {:else}
      <Button
        ghost
        mode="danger"
        title={$_("data.delete")}
        minW={false}
        value="delete"
        {disabled}
        on:click={() => ondelete?.({ key, value })}
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
