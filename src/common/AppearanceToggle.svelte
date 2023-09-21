<script>
  import emitter from "@/emit.js";

  const emit = emitter({
    change() {},
  });

  export let option;
  export let help;
  let selected = option.selected;

  $: {
    if (selected != option.selected) {
      selected = option.selected;
      emit.change();
    }
  }
</script>

<style lang="scss">
  .toggle {
    box-sizing: border-box;
    padding: 3px 0;
    margin: 0;

    h1 {
      font-size: 16px;
      font-weight: bold;
      margin: 3px 0;
    }

    .labels {
      margin: 0 -8px;

      label {
        @include buttonLike;

        display: inline-block;
        padding: 5px 14px 5px 6px;
        max-width: 200px;
        vertical-align: top;
        margin: 4px;

        input {
          vertical-align: top;
        }

        h2 {
          font-size: 16px;
          margin: 0;
          display: inline-block;
          vertical-align: top;
          font-weight: normal;
        }

        p {
          font-size: 14px;
          margin: 5px 0 5px 24px;
          color: $gray;
        }
      }
    }
  }
</style>

<div class="toggle">
  <h1>{option.title}</h1>
  <div class="labels">
    {#each option.values as value, i}
      <label>
        <input type="radio" value={i} bind:group={option.selected} />
        <h2>{value[0]}</h2>
        {#if help}
          <p>{value[1]}</p>
        {/if}
      </label>
    {/each}
  </div>
</div>
