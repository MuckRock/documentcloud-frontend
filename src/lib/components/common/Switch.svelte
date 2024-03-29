<script lang="ts">
  export let checked = false;
  export let disabled = false;

  function handleClick(event) {
    const state = event.target.getAttribute("aria-checked");
    checked = state === "true" ? false : true;
  }
</script>

<div class="switch" class:disabled>
  <button {disabled} role="switch" aria-checked={checked} on:click={handleClick}
  ></button>
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
    background: var(--gray-3);
    border: none;
    border-radius: 1.5em;
    cursor: pointer;
  }

  .switch button::before {
    content: "";
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    background: var(--gray-1);
    top: 0.125em;
    right: 1.4em;
    transition: transform 0.3s;
    border-radius: 0.75em;
  }

  .switch button[aria-checked="true"] {
    background-color: var(--blue-3);
  }

  .switch button[aria-checked="true"]::before {
    transform: translateX(1.3em);
    transition: transform 0.3s;
  }

  .switch button:focus {
    box-shadow: 0 0px 0px 1px var(--blue-3);
  }
</style>
