<script>
  import { elementInside } from "@/util/dom";
  import { _ } from "svelte-i18n";

  // SVG assets
  import checkmarkBlackSvg from "@/assets/checkmark_black.svg";

  export let options;
  export let selected;

  let input;
  let elem;
  let expanded = false;

  $: {
    if (input != null) input.focus();
  }

  function makeNameMap(options) {
    const results = {};
    for (let i = 0; i < options.length; i++) {
      results[options[i][0]] = options[i][1];
    }
    return results;
  }

  $: nameMap = makeNameMap(options);
  $: selectedName = nameMap[selected] || "";

  let filter = "";

  function applyFilter(options, filter) {
    const normalize = (x) =>
      x
        .toLowerCase()
        .split(" ")
        .map((x) => x.trim())
        .filter((x) => x.length > 0);
    const filterParts = normalize(filter);
    if (filterParts.length == 0) return options;

    const scores = [];
    for (let i = 0; i < options.length; i++) {
      const optionParts = normalize(options[i][1]);
      let score = 0;
      // Rudimentary scoring function based on number of matching parts
      for (let j = 0; j < filterParts.length; j++) {
        let found = false;
        for (let k = 0; k < optionParts.length; k++) {
          if (optionParts[k].indexOf(filterParts[j]) != -1) {
            found = true;
            break;
          }
        }
        if (found) score++;
      }
      if (score > 0) {
        scores.push([options[i], score]);
      }
    }
    return scores.sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  }

  $: filteredLanguages = applyFilter(options, filter);

  function select(value) {
    selected = value;
    filter = "";
  }

  function unexpand() {
    expanded = false;
    filter = "";
  }

  function handleClick(e) {
    if (expanded && elem != null) {
      if (!elementInside(e.target, elem)) {
        unexpand();
      }
    }
  }
</script>

<style lang="scss">
  .omniselect {
    display: inline-block;
    vertical-align: top;
  }

  .unexpanded {
    display: inline-block;
    vertical-align: middle;
    font-size: 16px;
    margin-left: 3px;
    padding: 2px 3px;
    border-bottom: solid 1px $gray;
    user-select: none;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  .omni {
    border: solid 1px gainsboro;
    display: inline-block;
    font-size: 16px;
    border-radius: 3px;
    vertical-align: top;
    margin-left: 6px;

    .filter input {
      outline: none;
      border: none;
      padding: 9px 14px;
      font-style: italic;
      font-size: 16px;
    }

    .selected,
    .option {
      padding: 3px 14px;
      user-select: none;
    }

    .selected {
      padding-top: 8px;
      padding-bottom: 8px;
      border-top: solid 1px gainsboro;
      border-bottom: solid 1px gainsboro;
      box-sizing: border-box;
      font-weight: 500;

      .check :global(svg) {
        padding-left: 3px;
        height: 14px;
      }
    }

    .options {
      padding: 5px 0;

      .option {
        cursor: pointer;

        &:hover {
          background: #dfeef9;
        }

        &.noresults {
          font-size: 14px;
          color: $gray;

          &:hover {
            background: rgb(233, 233, 233);
          }
        }
      }

      max-height: 220px;
      overflow-y: auto;
    }
  }
</style>

<div class="omniselect" bind:this={elem}>
  {#if expanded}
    <div class="omni">
      <div class="filter">
        <input
          bind:this={input}
          bind:value={filter}
          type="text"
          placeholder={$_("omniselect.filter")}
        />
      </div>
      <div class="selected">
        {selectedName}
        <span class="check">
          {@html checkmarkBlackSvg}
        </span>
      </div>
      <div class="options">
        {#if filteredLanguages.length > 0}
          {#each filteredLanguages as [value, name]}
            {#if value != selected}
              <div
                class="option"
                on:click={() => {
                  select(value);
                  unexpand();
                }}
              >
                {name}
              </div>
            {/if}
          {/each}
        {:else}
          <div
            class="option noresults"
            on:click={(e) => {
              filter = "";
              e.stopPropagation();
            }}
          >
            {$_("omniselect.noResults")}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div
      class="unexpanded"
      on:click={(e) => {
        expanded = true;
        e.stopPropagation();
      }}
    >
      {selectedName}
      <span class="dropper">▼</span>
    </div>
  {/if}
</div>

<svelte:window on:click={handleClick} />
