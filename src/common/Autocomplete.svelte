<script>
  export let value;
  export let method = null;
  export let allData = null;
  export let placeholder = "";
  let inputValue = "";
  let inputId = 0;

  let completions = null;
  const MAX_RESULTS = 10;

  function filter(allData, inputValue) {
    if (allData == null)
      throw new Error("Must specify allData if method is null");
    return allData.filter((x) =>
      x.name.trim().toLowerCase().startsWith(inputValue.trim().toLowerCase()),
    );
  }

  function autocomplete() {
    // Use an id to make sure to only report most recent result
    inputId++;
    const originalId = inputId;
    // Apply latency to reduce flow of requests during typing
    setTimeout(async () => {
      if (inputId != originalId) return;
      const results =
        method == null ? filter(allData, inputValue) : await method(inputValue);
      if (inputId == originalId) {
        completions = results.slice(0, MAX_RESULTS);
      }
    }, 100);
  }

  $: {
    autocomplete(inputValue);
  }
</script>

<style lang="scss">
  .autocomplete {
    display: inline-block;
    background: white;
    border: solid 1px gainsboro;
    border-radius: $radius;

    .message {
      font-style: italic;
      padding: 3px 9px;
    }

    .tag {
      display: inline-block;
      background: whitesmoke;
      padding: 3px 9px;
      margin: 3px;
      border-radius: $radius;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.33);

      &.clickable {
        @include buttonLike;
        font-style: italic;
        background: ivory;
      }
    }

    input {
      width: 100%;
      height: 100%;
      background: none;
      border: none;
      box-sizing: border-box;

      &:disabled {
        color: black;
        user-select: none;
      }
    }
  }
</style>

<span class="autocomplete">
  {#if value != null}
    <span class="tag"
      >{value.name}
      <span
        class="close"
        on:click={() => {
          value = null;
          completions = null;
          inputValue = "";
          autocomplete();
        }}>×</span
      ></span
    >
  {:else}
    <input {placeholder} bind:value={inputValue} />
    {#if completions == null}
      <span class="message">Loading completions...</span>
    {:else if completions.length > 0}
      {#each completions as completion}
        <span class="tag clickable" on:click={() => (value = completion)}
          >{completion.name}</span
        >
      {/each}
    {:else}
      <span class="message">No results found</span>
    {/if}
  {/if}
</span>
