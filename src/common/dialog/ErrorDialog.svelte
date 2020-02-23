<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";

  export let error;

  $: unexpected = error.errorData == null;

  function extractErrorData(data) {
    const items = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        items.push({
          key,
          values: data[key]
        });
      }
    }
    return items;
  }

  $: errorData =
    error.errorData != null ? extractErrorData(error.errorData) : null;

  const emit = emitter({
    dismiss() {}
  });
</script>

<style lang="scss">
  .errorcontainer {
    margin: 15px 0;
    border-radius: $radius;
    background: rgba($caution, 0.04);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
    padding: 8px 13px;

    ul {
      margin: 5px 0;
      padding: 0 18px;
    }

    .reason {
      color: $gray;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }

    .error {
      color: $caution;
      font-size: 14px;
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      An
      {#if unexpected}unexpected{/if}
      error occurred
    </h1>
    {#if unexpected}
      <p>Please try again later.</p>
    {:else}
      {#each errorData as { key, values }}
        <div class="errorcontainer">
          <div class="reason">{key}:</div>
          <ul>
            {#each values as value}
              <li class="error">{value}</li>
            {/each}
          </ul>
        </div>
      {/each}
    {/if}
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>Close</Button>
    </div>
  </div>
</div>
