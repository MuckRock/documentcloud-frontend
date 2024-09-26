<!--
  Dropdown2.svelte

  Every dropdown has a required "id" property. This tracks its opened state.

  Internally, the dropdown component sets its own state in response to DOM events.
  
  But, the dropdown state is exposed as an object of id-boolean pairs so that
  each dropdown may also be controlled externally. For example, closing a dropdown
  after a menu item has been clicked.

  Dropdowns also provide optional properties to control "position" and whether an
  overlay should be shown behind it when it is open.
-->

<script lang="ts" context="module">
  import { writable } from "svelte/store";
  // Create a store to make dropdown state editable from outside
  const dropdowns = writable<Record<string, boolean>>({});

  export function openDropdown(id) {
    dropdowns.update((state) => ({ ...state, [id]: true }));
  }

  export function closeDropdown(id) {
    dropdowns.update((state) => ({ ...state, [id]: false }));
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  export let id: string;
  export let position = "bottom left";
  export let overlay = true;
  export let border = false;
  export let titleColor = "primary";

  // State
  let dropdown;
  let title;
  $: isOpen = $dropdowns[id];

  function toggleDropdown() {
    if (isOpen) {
      closeDropdown(id);
    } else {
      openDropdown(id);
    }
  }

  // Toggle the dropdown when the title is interacted with
  function toggleOnTitleEvent(event: MouseEvent | KeyboardEvent) {
    switch (event.type) {
      case "click":
        toggleDropdown();
        break;
      case "keydown":
        const key = (event as KeyboardEvent).key;
        if (["Spacebar", " ", "Enter", "ArrowDown"].includes(key)) {
          toggleDropdown();
        }
        break;
      default:
    }
  }

  // Close the dropdown when a click or escape is made outside its subtree
  function closeOnEventOutside(event: MouseEvent) {
    const outside = !dropdown.contains(event.target);
    const notTitle = !title.contains(event.target);
    if (outside && notTitle) {
      closeDropdown(id);
    }
  }

  function closeOnEscape(event: KeyboardEvent) {
    const key = (event as KeyboardEvent).key;
    if (key === "Escape") {
      closeDropdown(id);
    }
  }

  onMount(() => {
    document.addEventListener("click", closeOnEventOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("click", closeOnEventOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  });
</script>

<!-- Optional window overlay -->
{#if overlay && isOpen}
  <div class="overlay" />
{/if}
<!-- Element to Trigger Dropdown -->
<div class="dropdownContainer" class:open={isOpen} {id}>
  <div
    role="button"
    tabindex={0}
    bind:this={title}
    class={`title ${titleColor}`}
    class:open={isOpen}
    class:border
    on:click={toggleOnTitleEvent}
    on:keydown={toggleOnTitleEvent}
  >
    <slot name="title" />
  </div>
  <!-- Dropdown with contents -->
  <div
    bind:this={dropdown}
    class="dropdown"
    class:open={isOpen}
    class:top={position.includes("top")}
    class:bottom={position.includes("bottom")}
    class:left={position.includes("left")}
    class:right={position.includes("right")}
    class:center={position.includes("center")}
  >
    <slot />
  </div>
</div>

<style>
  .dropdownContainer {
    position: relative;
    display: flex;
    align-items: center;
    z-index: var(--z-dropdown);
  }
  .title {
    display: inline-block;
    cursor: pointer;
    border-radius: 0.5rem;
    padding: 0.075rem;
    color: var(--gray-5);
    fill: var(--gray-4);
  }
  .title.border {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .title:hover {
    background: var(--blue-1);
  }
  .title.open {
    background: var(--blue-1);
    color: var(--white);
    fill: var(--white);
  }
  .title.premium {
    color: var(--premium);
    fill: var(--premium);
  }
  .title.premium.open {
    background: var(--premium);
    color: var(--white);
    fill: var(--white);
  }
  .dropdown {
    display: none;
    margin: 0.25rem 0;
    width: auto;
    min-width: 100%;
  }
  .dropdown.open {
    display: block;
    position: absolute;
  }
  .dropdown.top {
    bottom: calc(100% + var(--offset, 0px));
  }
  .dropdown.bottom {
    top: calc(100% + var(--offset, 0px));
  }
  .dropdown.left {
    left: 0;
  }
  .dropdown.right {
    right: 0;
  }
  .dropdown.center {
    left: 50%;
    transform: translateX(-50%);
  }

  .overlay {
    z-index: var(--z-dropdownBackdrop);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 32rem) {
    .dropdownContainer {
      position: unset;
    }
    .dropdown.open,
    .dropdown.left.open,
    .dropdown.right.open {
      left: 0;
      right: 0;
      width: 100vw;
      z-index: var(--z-dropdown);
    }
  }
</style>
