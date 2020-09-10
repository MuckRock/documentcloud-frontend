<script>
  import emitter from "@/emit";

  const emit = emitter({
    change() {}
  });

  export let option;
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
    border: solid 1px gainsboro;
    box-sizing: border-box;
    border-radius: $radius;
    padding: 5px 14px;
    margin: 11px 0;
    background: #f3f3f3;

    h1 {
      font-size: 16px;
      font-weight: bold;
      margin: 5px 0;
    }

    .labels {
      margin: 0 -8px;

      label {
        @include buttonLike;

        display: inline-block;
        border: solid 1px gainsboro;
        border-radius: 3px;
        padding: 5px 14px 5px 6px;
        max-width: 200px;
        vertical-align: top;
        margin: 4px;
        background: white;

        input {
          vertical-align: top;
        }

        h2 {
          font-size: 14px;
          margin: 0;
          display: inline-block;
          vertical-align: top;
        }

        p {
          font-size: 14px;
          margin: 5px 0 5px 24px;
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
        <p>{value[1]}</p>
      </label>
    {/each}
  </div>
</div>
