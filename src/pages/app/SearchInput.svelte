<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { highlight, parse } from "@/search/query";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { projects } from "@/manager/projects";
  import { textAreaResize } from "@/util/textareaResize";

  // SVG assets
  import searchIconSvg from "@/assets/search_icon.svg";

  const emit = emitter({
    search() {}
  });

  export let value = "";
  let input;
  let mirror;

  $: {
    if (input != null) {
      // Dispatch input event to handle textarea resize on load
      input.value = value;
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
          target: input
        })
      );
    }
  }

  let selectionStart = null;
  let selectionEnd = null;
  let focused = false;
  let scrollLeft = 0;

  let autocomplete = "";

  let completions = ["My project", "My other project"];
  let completionIndex = 0;

  $: {
    if (mirror != null) mirror.scrollLeft = scrollLeft;
  }

  function updateScroll() {
    if (input != null && mirror != null) {
      mirror.scrollLeft = input.scrollLeft;
    }
  }

  function handleCursor() {
    updateScroll();
    selectionStart = input.selectionStart;
    selectionEnd = input.selectionEnd;
    if (selectionStart == null || selectionEnd == null) return;
    focused = true;
  }

  function handleBlur() {
    handleCursor();
    focused = false;
  }

  function handleKeyDown(e) {
    if (e.which == 13 || e.keyCode == 13) {
      // Search on enter
      emit.search();
      e.preventDefault();
      return;
    }

    handleCursor();

    // Prevent moving cursor to beginning/end
    if (completions.length > 0)
      if (completions.length > 0) {
        if (e.key == "ArrowUp") {
          e.preventDefault();
          if (completionIndex > 0) completionIndex--;
        } else if (e.key == "ArrowDown") {
          e.preventDefault();
          if (completionIndex < completions.length - 1) completionIndex++;
        }
      }
  }

  function handleKeyUp(e) {
    handleCursor();
  }

  $: highlights = highlight(value);
</script>

<style lang="scss">
  $fontSize: 16px;
  $wordSpacing: 1px;

  .search {
    border-radius: $radius;
    margin: 0;
    width: 100%;
    position: relative;
    box-sizing: border-box;
    max-width: 750px;

    @media only screen and (max-width: 600px) {
      margin: 0 0 44px 0;
    }

    :global(svg) {
      position: absolute;
      pointer-events: none;
      padding: 13px 17px;
    }
  }

  textarea {
    -webkit-text-fill-color: transparent;
    outline: none;
    font-size: $fontSize;
    background: #f1f2f4;

    &:focus {
      background: white;
      border: solid 1px $viewerDarkGray;

      & + .mirror .autocomplete {
        display: inline-block;
      }
    }
  }

  .mirror,
  textarea {
    line-height: 1.6;
    font-family: inherit;
    border: none;
    padding-left: 56px;
    padding-right: 12px;
    padding: 9px 12px 9px 56px;
    box-sizing: border-box;
    border: solid 1px transparent;
    width: 100%;
    height: 100%;
    overflow: none;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-spacing: $wordSpacing;
  }

  .mirror {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    color: black;
    -webkit-text-fill-color: black;

    word-spacing: 0;
    font-size: 0;

    > span {
      &.autocomplete {
        padding-left: 2px;
        color: rgba(0, 0, 0, 0.33);
        display: none;
      }

      &.field {
        > span {
          border-radius: $radius;
          background: rgba(blue, 0.02);
          box-shadow: 0 0 0 1px rgba(black, 0.12);
        }
      }

      > span {
        position: relative;
        font-size: $fontSize;
        word-spacing: $wordSpacing;
      }
    }
  }

  .tagbank {
    padding: 25px 0;
    border-bottom: solid 1px gainsboro;

    h1 {
      font-size: 18px;
      margin-bottom: 20px;

      .small {
        font-size: 14px;
        color: $gray;
        font-weight: normal;
        margin-left: 10px;
      }
    }

    .completions {
      color: $gray;
      font-size: 16px;
      max-width: 450px;

      .completion {
        padding: 5px;

        &.active {
          background: rgba(66, 148, 240, 0.15);
        }
      }
    }
  }

  ::placeholder {
    color: rgba(0, 0, 0, 0.76);
    -webkit-text-fill-color: $gray;
  }
</style>

<div class="search">
  {@html searchIconSvg}
  <textarea
    use:textAreaResize={0}
    bind:this={input}
    bind:value
    placeholder="Search"
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
    on:click={handleCursor}
    on:touchend={handleCursor}
    on:focus={handleCursor}
    on:blur={handleBlur} />
  <div class="mirror" bind:this={mirror}>
    {#each highlights as highlight}
      {#if highlight.type == 'field'}
        <span class="field">
          <span>{highlight.text}</span>
        </span>
      {:else}
        {#each highlight.text.split(/( )/g) as rawText}
          <!-- Split raw text by space to avoid line-break issues -->
          <span>
            <span>{rawText}</span>
          </span>
        {/each}
      {/if}
    {/each}
    {#if autocomplete.length > 0}
      <span class="autocomplete">
        <span>{autocomplete}</span>
      </span>
    {/if}
  </div>
</div>
<div class="tagbank">
  <h1>
    Filter by projects:
    <span class="small">Keep typing to filter this list.</span>
  </h1>
  <div class="completions">
    {#each completions as completion, i}
      <div class="completion" class:active={completionIndex == i}>
        {completion}
      </div>
    {/each}
  </div>
  <div>All users:</div>
  <ul>
    {#each $orgsAndUsers.allUsers as user}
      <li>{JSON.stringify(user)}</li>
    {/each}
  </ul>
  <div>All orgs:</div>
  <ul>
    {#each $orgsAndUsers.organizations as org}
      <li>{JSON.stringify(org)}</li>
    {/each}
  </ul>
  <div>All projects:</div>
  <ul>
    {#each $projects.projects as project}
      <li>{project.id} - {project.title} - {project.description}</li>
    {/each}
  </ul>
</div>
