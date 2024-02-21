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

  const dispatch = createEventDispatcher();
  let input: HTMLInputElement;
  let inputValue: number = page;
  $: inputWidth = String(inputValue ?? 0).length;
  $: invalidValue = inputValue > totalPages || !inputValue;
  $: {
    inputValue = page;
  }

  export function previous() {
    dispatch("previous");
  }

  export function next() {
    dispatch("next");
  }

  export function goTo(page: number) {
    dispatch("goTo", page);
  }

  function handleChange() {
    if (invalidValue || inputValue === page) {
      inputValue = page;
      return;
    }
    console.log(inputValue);
    goTo(inputValue);
  }

  function handleKeyup({ key }: KeyboardEvent) {
    if (input != document.activeElement) return;
    switch (key) {
      case "Escape":
      case "Enter":
        input.blur();
        break;
      // case "Enter":
      //   if (invalidValue) {
      //     inputValue = page;
      //   } else if (inputValue !== page) {
      //     goTo(inputValue);
      //   }
      //   input.blur();
      //   break;
      // case "ArrowUp":
      //   next();
      //   break;
      // case "ArrowDown":
      //   previous();
      //   break;
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
