<script>
  import emitter from "@/emit";
  import { _ } from 'svelte-i18n';

  const emit = emitter({
    change() {},
  });

  export let option;
  export let help;
  let automaticText = option.automaticText;
  let fixedText = option.fixedText;
  let value = option.selected;
  let selected = option.selected == 0 ? 0 : 1;
  let fixed = option.selected == 0 ? 500 : option.selected;

  $: {
    if (fixed < 0) fixed = 1;
  }
  $: newValue = selected == 0 ? 0 : fixed;

  $: {
    if (value != newValue) {
      option.selected = newValue;
      emit.change();
      value = newValue;
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

        .numinput {
          width: 50px;
          float: right;
          margin-left: 8px;
        }
      }
    }
  }
</style>

<div class="toggle">
  <h1>{option.title}</h1>
  <div class="labels">
    <label>
      <input type="radio" value={0} bind:group={selected} />
      <h2>{$_("appearanceDimension.responsive")}</h2>
      {#if help}
        <p>{automaticText}</p>
      {/if}
    </label>
    <label>
      <input type="radio" value={1} bind:group={selected} />
      <h2>{$_("appearanceDimension.fixed")}</h2>
      {#if selected == 1}
        <input class="numinput" type="number" min="1" bind:value={fixed} />
      {/if}
      {#if help}
        <p>{fixedText}</p>
      {/if}
    </label>
  </div>
</div>
