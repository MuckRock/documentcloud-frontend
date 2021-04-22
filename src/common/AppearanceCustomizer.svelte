<script>
  import Button from "@/common/Button";
  import AppearanceToggle from "./AppearanceToggle";
  import AppearanceDimension from "./AppearanceDimension";
  import emitter from "@/emit";
  import { timeoutify } from "@/util/closure";

  export let options;
  export let storageManager = null;

  let help = false;

  const emit = emitter({
    change() {},
  });

  const change_ = (e) => {
    if (storageManager != null) {
      // Remember preferences
      for (let i = 0; i < options.length; i++) {
        storageManager.set(options[i].option, options[i].selected);
      }
    }

    emit.change(e);
  };

  const change = timeoutify(change_, 250);
</script>

<style lang="scss">
  $appearanceHeight: 400px;

  details {
    position: relative;
  }

  summary {
    @include buttonLike;

    outline: none;
    color: $primary;
    font-size: 14px;
    font-family: inherit;
    margin-bottom: 6px;
  }

  .optionscrollcontainer {
    max-height: $appearanceHeight;
    border: solid 1px gainsboro;
    border-radius: $radius;
    position: relative;
    overflow: hidden;
    margin: 5px 0;
    max-width: 600px;
  }

  .optionscroll {
    max-height: $appearanceHeight;
    overflow: auto;
    padding: 5px 16px 0 16px;
  }

  .optionspacer {
    height: 50px;
  }

  .scrollfade {
    position: absolute;
    background: linear-gradient(180deg, #ffffff00, white);
    width: 100%;
    height: 50px;
    margin-top: -50px;
    pointer-events: none;
  }
</style>

<details>
  <summary>Customize Appearance</summary>
  <Button on:click={() => (help = !help)} nondescript={true}
    >{#if help}Hide{:else}Show{/if} help text</Button
  >
  <div class="optionscrollcontainer">
    <div class="optionscroll">
      {#each options as option}
        {#if option.type == "toggle"}
          <AppearanceToggle {help} on:change={change} {option} />
        {:else if option.type == "dimension"}
          <AppearanceDimension {help} on:change={change} {option} />
        {/if}
      {/each}
      <div class="optionspacer" />
    </div>
    <div class="scrollfade" />
  </div>
</details>
