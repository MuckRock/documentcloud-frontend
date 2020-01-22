<script>
  // SVG Assets
  import checkmarkSvg from "@/assets/checkmark.svg";
  import checklineSvg from "@/assets/checkline.svg";

  import emitter from "@/emit";

  const emit = emitter({
    check() {},
    uncheck() {}
  });

  export let checked = false;
  export let indeterminate = false;
  let checkbox;

  function handleChange() {
    if (checked) {
      emit.check({ indeterminate });
    } else {
      emit.uncheck();
    }
  }
</script>

<style lang="scss">
  $checksize: 15px;
  $checklinesize: 11px;
  $xOff: 0;

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
      border: solid 1px #bbbbbb;
      display: inline-block;
      border-radius: 2px;
      cursor: pointer;
      transition: box-shadow 0.2s ease, border 0.2s ease;
      user-select: none;
      position: relative;

      &:hover {
        border: solid 1px $primary;
      }

      :global(.checkmark) {
        position: absolute;
        width: $checksize;
        height: $checksize;
        left: ($checkboxSize - $checksize) / 2 + $xOff;
        top: ($checkboxSize - $checksize) / 2;
      }

      :global(.checkline) {
        position: absolute;
        width: $checklinesize;
        height: $checklinesize;
        left: ($checkboxSize - $checklinesize) / 2 + $xOff;
        top: ($checkboxSize - $checklinesize) / 2;
      }
    }

    input:focus + span {
      border: solid 1px $primary;
    }

    input:checked + span {
      background: $primary;
      border: solid 1px $primary;
    }

    input:checked:focus + span {
      box-shadow: 0 0 0 2px $primary-faded;
      border: solid 1px $primary;
    }
  }
</style>

<label>
  <input
    type="checkbox"
    bind:this={checkbox}
    bind:checked
    on:change={handleChange} />
  <span>
    {#if checked}
      {#if indeterminate}
        {@html checklineSvg}
      {:else}
        {@html checkmarkSvg}
      {/if}
    {/if}
  </span>
</label>
