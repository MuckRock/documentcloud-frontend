<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import Button from "./Button.svelte";
  import {
    ArrowLeft16,
    ArrowRight16,
    MoveToEnd16,
    MoveToStart16,
  } from "svelte-octicons";

  export let page: number | undefined = undefined;
  export let totalPages: number | undefined = undefined;
  export let has_next = false;
  export let has_previous = false;
  export let goToNav = false;

  var isInt = /^[0-9]+$/;

  const dispatch = createEventDispatcher();
  let input: HTMLInputElement;
  // proxy the page value so we can reset it if needed
  let inputValue = page;
  $: inputWidth = String(inputValue ?? 0).length;
  $: invalidValue =
    inputValue > totalPages ||
    !inputValue ||
    !isInt.test(inputValue.toString());
  $: {
    inputValue = page;
  }

  function previous() {
    dispatch("previous", page - 1);
  }

  function next() {
    dispatch("next", page + 1);
  }

  function goTo(page: number) {
    dispatch("goTo", page);
  }

  function handleChange(event: Event) {
    if (invalidValue || inputValue === page) {
      inputValue = page;
      return;
    }
    const { value } = event.target as HTMLInputElement;
    goTo(parseInt(value));
  }

  function handleKeyup({ key }: KeyboardEvent) {
    if (input != document.activeElement) return;
    switch (key) {
      case "Escape":
      case "Enter":
        input.blur();
        break;
    }
  }
</script>

<div class="paginator">
  {#if page && totalPages && goToNav}
    <Button
      square
      ghost
      disabled={page === 1}
      on:click={() => goTo(1)}
      title={$_("paginator.first")}
    >
      <MoveToStart16 />
    </Button>
  {/if}
  <Button
    square
    ghost
    disabled={!has_previous}
    on:click={previous}
    title={$_("paginator.previous")}
  >
    <ArrowLeft16 />
  </Button>
  {#if page}
    <div class="current">
      <span class="page">{$_("paginator.page")}</span>
      {#if goToNav}
        <input
          name="page"
          class="pageNumber"
          class:error={invalidValue}
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          min="1"
          max={totalPages}
          bind:this={input}
          bind:value={inputValue}
          on:change={handleChange}
          on:keyup={handleKeyup}
          style={`width: ${inputWidth}ch`}
        />
      {:else}
        <span class="pageNumber">{page}</span>
      {/if}
      {#if totalPages}<span class="rest">{$_("paginator.of")} {totalPages}</span
        >{/if}
    </div>
  {/if}
  <Button
    square
    ghost
    disabled={!has_next}
    on:click={next}
    title={$_("paginator.next")}
  >
    <ArrowRight16 />
  </Button>
  {#if page && totalPages && goToNav}
    <Button
      square
      ghost
      disabled={page === totalPages}
      on:click={() => goTo(totalPages)}
      title={$_("paginator.last")}
    >
      <MoveToEnd16 />
    </Button>
  {/if}
</div>

<style>
  .paginator {
    display: flex;
    justify-content: center;
    position: relative;
    width: 100%;
  }

  .current {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0 1rem;
  }

  input.pageNumber {
    flex: 0 1 auto;
    padding: 0.125rem;
    text-align: center;
    border-color: rgba(0, 0, 0, 0.125);
    box-shadow: none;
  }

  input.pageNumber:hover,
  input.pageNumber:focus {
    border-color: rgba(0, 0, 0, 0.25);
  }

  /* Hide arrows from number input */
  /* Chrome, Safari, Edge, Opera */
  input.pageNumber::-webkit-outer-spin-button,
  input.pageNumber::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input.pageNumber[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .rest {
    white-space: nowrap;
  }

  .pageNumber.error {
    outline-color: var(--caution);
  }
</style>
