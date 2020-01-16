<script>
  // SVG Assets
  import checkmarkSvg from "@/assets/checkmark.svg";

  import emitter from "@/emit";

  const emit = emitter({
    check() {},
    uncheck() {}
  });

  export let checked = false;
  export let indeterminate = false;
  let checkbox;

  $: {
    if (checked) {
      emit.check({ indeterminate });
    } else {
      emit.uncheck();
    }
  }
</script>

<style lang="scss">
  $checksize: 15px;
  $xOff: 0.5px;

  label {
    display: inline-block;
    height: $checkboxSize;
    width: $checkboxSize;

    input {
      opacity: 0;
      position: fixed;
      z-index: $checkboxZ;
    }

    span {
      height: $checkboxSize;
      width: $checkboxSize;
      box-shadow: 0 0 0 0.5px $gray;
      display: inline-block;
      border-radius: 2px;
      cursor: pointer;
      transition: box-shadow 0.2s ease;
      user-select: none;
      position: relative;

      &:hover {
        box-shadow: 0 0 0 1px $primary;
      }

      .indeterminate {
        color: white;
        text-align: center;
        line-height: $checkboxSize;
        font-weight: bold;
        font-size: $checkboxSize;
        position: absolute;
      }

      :global(svg) {
        position: absolute;
        width: $checksize;
        height: $checksize;
        left: ($checkboxSize - $checksize) / 2 + $xOff;
        top: ($checkboxSize - $checksize) / 2;
      }
    }

    input:focus + span {
      box-shadow: 0 0 0 1px $primary;
    }

    input:checked + span {
      background: $primary;
      box-shadow: 0 0 0 1px $primary;
    }

    input:checked:focus + span {
      box-shadow: 0 0 0 1px $primary, 0 0 0 2px $primary-faded;
    }
  }
</style>

<label>
  <input type="checkbox" bind:this={checkbox} bind:checked />
  <span>
    {#if checked}
      {#if indeterminate}
        <span class="indeterminate">–</span>
      {:else}
        {@html checkmarkSvg}
      {/if}
    {/if}
  </span>
</label>
