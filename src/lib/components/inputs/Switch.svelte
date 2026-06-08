<script lang="ts">
  import type { Nullable } from "$lib/api/types";

  interface Props {
    name?: Nullable<string>;
    checked?: boolean;
    disabled?: boolean;
    onchange?: (e: Event) => void;
  }

  let {
    name = null,
    checked = $bindable(false),
    disabled = false,
    onchange,
  }: Props = $props();

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    const state = (event.target as HTMLButtonElement).getAttribute(
      "aria-checked",
    );
    checked = state === "true" ? false : true;
  }
</script>

<div class="switch" class:disabled>
  <button
    {disabled}
    role="switch"
    aria-checked={checked}
    title={name}
    onclick={handleClick}
  ></button>
  <input
    {name}
    type="checkbox"
    bind:checked
    class="hidden"
    onchange={(e) => onchange?.(e)}
  />
</div>

<style>
  .switch {
    display: flex;
    align-items: center;
  }

  .switch.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }

  .switch button {
    width: 3em;
    height: 1.75em;
    position: relative;
    background: var(--gray-2);
    border: none;
    border-radius: 1.5em;
    cursor: pointer;
    box-shadow: inset 0 1px 4px 0px var(--gray-3);
  }

  .switch button::before {
    content: "";
    position: absolute;
    width: 1.25em;
    height: 1.25em;
    background: var(--white);
    top: 0.25em;
    right: 1.5em;
    transition: transform 0.3s;
    border-radius: 0.75em;
    box-shadow: 0 1px 4px 0px var(--gray-3);
  }

  .switch button[aria-checked="true"] {
    background: var(--blue-3);
    box-shadow: inset 0 1px 4px 0px var(--blue-4);
  }

  .switch button[aria-checked="true"]::before {
    transform: translateX(1.3em);
    transition: transform 0.3s;
    box-shadow: 0 1px 4px 0px var(--blue-4);
  }

  .switch button:focus {
    outline: var(--blue-3) solid 1px;
  }

  .hidden {
    display: none;
  }
</style>
