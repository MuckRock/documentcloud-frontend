<!-- @component
Input for a single key/value pair or tag (where `key` is `_tag`).
This uses `svelte-select` to let users more easily choose existing keys.
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    CheckCircle16,
    ChevronDown12,
    PlusCircle16,
    Trash16,
    X12,
    XCircle16,
  } from "svelte-octicons";
  import Select from "svelte-select";

  import Button from "../common/Button.svelte";

  export let keys: string[] = ["_tag"];
  export let key: string = "";
  export let value: string = "";

  const dispatch = createEventDispatcher();

  $: items = keys.map((key) => {
    const label = key === "_tag" ? $_("data.tag") : key;
    return { value: key, label, created: false };
  });

  function setKey(e) {}

  function setValue(e) {}
</script>

<tr class="kv">
  <td class="key">
    <Select
      name="key"
      {items}
      value={key}
      bind:justValue={key}
      required
      showChevron
      placeholder={$_("data.newkey")}
      class="select elevated"
      on:change
      on:input
      on:blur
      on:clear
      on:filter
    >
      <ChevronDown12 slot="chevron-icon" />
      <X12 slot="clear-icon" />
      <div slot="item" let:item>
        <p>{item.label}</p>
      </div>
    </Select>
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
        required
        on:change={console.log}
        on:input
      />
    </label>
  </td>
  <td class="action">
    <Button
      mode="ghost"
      title={$_("data.update")}
      minW={false}
      value="update"
      on:click
    >
      <CheckCircle16 />
    </Button>
    <Button
      mode="ghost"
      title={$_("data.delete")}
      minW={false}
      value="delete"
      on:click
    >
      <Trash16 fill="var(--caution)" />
    </Button>
  </td>
</tr>

<style>
  td.key {
    --background: var(--white, #fff);
    --border: 0.25px solid var(--gray-3, #99a8b3);
    --border-radius: 0.25rem;
    --border-focused: 0.25px solid var(--blue-3, #4294f0);
    --font-size: var(--font-m, 1rem);
    --padding: 0 0 0 1rem;
    --item-hover-bg: var(--blue-1, #eef3f9);
    --item-is-active-bg: var(--blue-3, #4294f0);
    --list-shadow: var(--shadow);
    --list-border: 0.25px solid var(--gray-2, #d8dee2);

    min-width: 20ch;
  }

  td.value {
    min-width: 20ch;
  }

  td {
    padding: 0 0.5rem 0.5rem 0;
    --font-size: var(--font-s);
  }

  input.value {
    display: flex;
    padding: 0.375rem 0.75rem;
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
    font-size: var(--font-m, 1rem);
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  input.value::placeholder {
    color: var(--gray-3, #99a8b3);
  }

  :global(.select.elevated) {
    box-shadow: 0px 2px 0px 0px var(--gray-3, #99a8b3);
  }
  :global(.select.elevated.focused) {
    box-shadow: 0px 2px 0px 0px var(--blue-3, #1367d0);
  }
  :global(.select .indicators) {
    fill: var(--gray-5, #233944);
  }
  :global(.select.focused .indicators) {
    fill: var(--blue-5, #053775);
  }
  :global(.select input, .select .selected-item) {
    color: var(--gray-5, #233944);
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    line-height: normal;
    box-shadow: none;
  }
  :global(.select.focused input, .select.focused .selected-item) {
    color: var(--blue-5, #053775) !important;
  }
</style>
