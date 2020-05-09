<script>
  import Button from "@/common/Button";
  import NoWhitespace from "@/common/NoWhitespace";
  import emitter from "@/emit";
  import { highlight } from "@/search/parse";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { projects } from "@/manager/projects";
  import { textAreaResize } from "@/util/textareaResize";
  import { slugify, extractSlugId } from "@/util/string";

  // SVG assets
  import searchIconSvg from "@/assets/search_icon.svg";

  const emit = emitter({
    search() {}
  });

  export let value = "";
  export let example = false;
  export let compact = false;

  let input;
  let mirror;

  function forceInput() {
    if (input != null) {
      input.value = value;
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
          target: input
        })
      );
    }
  }

  $: {
    // Dispatch input event to handle textarea resize on load
    forceInput(value);
  }

  let selectionStart = null;
  let selectionEnd = null;
  let focused = false;

  let completions = [];

  function processCompletions() {
    let count = 0;
    for (let i = 0; i < completions.length; i++) {
      const completion = completions[i];
      if (completion.type == "field") {
        completion.index = count;
        count++;
      } else {
        completion.index = null;
      }
    }
    return {
      completions,
      count
    };
  }

  $: processedCompletions = processCompletions(completions);

  let completionIndex = null;

  $: selectedCompletion =
    completionIndex == null || completions.length == 0
      ? null
      : completions.filter(
          completion => completion.index == completionIndex
        )[0];

  $: noCompletion =
    !selectionAtEnd ||
    (selectedCompletion == null && completions.length == 0) ||
    (fieldPost != null && fieldPost.length > 0);
  $: autocomplete = noCompletion
    ? ""
    : selectedCompletion == null
    ? completions[0].feed
    : selectedCompletion.feed;

  function triggerCompletion(completion, deleteChars = 0) {
    if (
      completion.feed != null &&
      individualSelection &&
      selectionStart != null
    ) {
      const insert = completion.feed + " ";
      const restoreSelectionPosition =
        selectionStart + insert.length - deleteChars;
      value =
        value.substr(0, selectionStart - deleteChars) +
        insert +
        value.substr(selectionStart);
      forceInput();
      if (input != null && input.setSelectionRange != null) {
        input.setSelectionRange(
          restoreSelectionPosition,
          restoreSelectionPosition
        );
      }
      selectionStart = restoreSelectionPosition;
      selectionEnd = restoreSelectionPosition;
    }
  }

  function handleCursor() {
    selectionStart = input.selectionStart;
    selectionEnd = input.selectionEnd;
    if (selectionStart == null || selectionEnd == null) return;
    focused = true;
  }

  // Selection properties
  $: hasSelection = selectionStart != null && selectionEnd != null;
  $: individualSelection = hasSelection && selectionStart == selectionEnd;
  $: selectionAtEnd = individualSelection && selectionStart == value.length;

  // Autocomplete fields
  $: searchPre = individualSelection ? value.substr(0, selectionStart) : null;
  $: searchPost = individualSelection ? value.substr(selectionStart) : null;
  // Show completions if the end of input follows or a whitespace followed by anything
  $: showCompletions = searchPost != null && /^(\s.*|)$/.test(searchPost);
  $: fieldRaw =
    searchPre != null && showCompletions
      ? searchPre.match(/([a-z]+):([a-zA-Z0-9-]*)$/)
      : null;
  $: fieldPreIndex = fieldRaw != null ? fieldRaw.index : null;
  $: fieldPre = fieldRaw != null ? fieldRaw[1] : null;
  $: fieldPost = fieldRaw != null ? fieldRaw[2] : null;

  function completionScore(completion, filter) {
    // Calculate a score by how many characters match the filter
    const text = completion.text.toLowerCase();
    let score = 0;
    let lastPos = 0;
    let highlightLetters = [];
    for (let i = 0; i < filter.length; i++) {
      const char = filter.charAt(i).toLowerCase();
      const idx = text.indexOf(char, lastPos);
      if (idx == -1) {
        // Punish lack of match
        score -= 1;
      } else {
        // Reward match based on proximity
        score += 1 / (idx - lastPos + 1);
        highlightLetters.push(idx);
        lastPos = idx + 1;
      }
    }
    return { score, highlightLetters };
  }

  function completionFilter(candidates, filter) {
    if (filter.length == 0) return candidates;
    // Filter completion candidates based on what you've started typing
    const results = [];
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const { score, highlightLetters } = completionScore(candidate, filter);
      if (score != null) {
        results.push({ score, highlightLetters, ...candidate });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  let completionX = "";

  function setCompletionX(idx) {
    if (
      idx == null ||
      mirror == null ||
      highlights == null ||
      highlights.length == 0
    ) {
      return;
    }

    // Find which highlight the idx corresponds to

    // First get all child chunk elements by following same rules as DOM
    let allChunks = [];
    for (let i = 0; i < highlights.length; i++) {
      const highlight = highlights[i];
      allChunks = allChunks.concat(
        highlight.type == "raw"
          ? highlight.text.split(/( )/g).filter(x => x.length > 0)
          : [highlight.text]
      );
    }

    let pos = 0;
    let highlightIdx = allChunks.length - 1;
    for (let i = 0; i < allChunks.length; i++) {
      let end = pos + allChunks[i].length;
      if (idx >= pos && idx < end) {
        highlightIdx = i;
        break;
      }
      pos = end;
    }

    if (
      highlightIdx == null ||
      highlightIdx < 0 ||
      highlightIdx >= mirror.children.length
    ) {
      return;
    }

    // Update completion X position
    const completionLeft =
      mirror.children[highlightIdx].firstChild.getBoundingClientRect().x -
      mirror.getBoundingClientRect().x;
    const completionRight =
      mirror.getBoundingClientRect().right -
      mirror.children[highlightIdx].firstChild.getBoundingClientRect().right;
    // Anchor to left or right depending on which edge is closer
    if (completionLeft <= completionRight) {
      completionX = `left: ${completionLeft}px`;
    } else {
      completionX = `right: ${completionRight}px`;
    }
  }

  let escPressed = false;

  $: {
    if (escPressed) {
      completions = [];
      escPressed = false;
    } else if (fieldPre == "project") {
      setCompletionX(fieldPreIndex);
      completions = completionFilter(
        $projects.projects.map(project => {
          return {
            type: "field",
            text: project.title,
            feed: slugify(project.title, project.id)
          };
        }),
        fieldPost
      );
    } else if (fieldPre == "user") {
      setCompletionX(fieldPreIndex);

      const mappedUsers = [];
      for (let i = 0; i < $orgsAndUsers.allUsers.length; i++) {
        const user = $orgsAndUsers.allUsers[i];
        const isMe = orgsAndUsers.me != null && user.id == orgsAndUsers.me.id;
        const mappedUser = {
          type: "field",
          text: `${user.name}${isMe ? " (you)" : ""}`,
          feed: slugify(user.name, user.id)
        };
        if (isMe) {
          mappedUsers.unshift(mappedUser);
        } else {
          mappedUsers.push(mappedUser);
        }
      }

      completions = completionFilter(mappedUsers, fieldPost);
    } else if (fieldPre == "organization") {
      setCompletionX(fieldPreIndex);
      completions = completionFilter(
        $orgsAndUsers.organizations.map(org => {
          return {
            type: "field",
            text: org.name,
            feed: slugify(org.name, org.id)
          };
        }),
        fieldPost
      );
    } else if (fieldPre == "access") {
      setCompletionX(fieldPreIndex);
      completions = completionFilter(
        [
          {
            type: "field",
            text: "public",
            info: "Publicly accessible documents",
            feed: "public"
          },
          {
            type: "field",
            text: "private",
            info: "Privately accessible documents",
            feed: "private"
          },
          {
            type: "field",
            text: "organization",
            info: "Accessible at the organization level",
            feed: "organization"
          }
        ],
        fieldPost
      );
    } else if (fieldPre == "status") {
      setCompletionX(fieldPreIndex);
      completions = completionFilter(
        [
          {
            type: "field",
            text: "success",
            info: "Documents ready for viewing and publishing",
            feed: "success"
          },
          {
            type: "field",
            text: "readable",
            info: "Documents ready for reading but still processing text",
            feed: "readable"
          },
          {
            type: "field",
            text: "pending",
            info: "Documents currently processing",
            feed: "pending"
          },
          {
            type: "field",
            text: "error",
            info: "Documents with errors in preparation",
            feed: "error"
          },
          {
            type: "field",
            text: "nofile",
            info: "Documents that were not successfully uploaded",
            feed: "nofile"
          }
        ],
        fieldPost
      );
    } else {
      completions = [];
    }

    if (completions.length > 0) {
      completionIndex = 0;
    } else {
      completionIndex = null;
    }
  }

  function handleBlur() {
    handleCursor();
    completionIndex = null;
    focused = false;
  }

  function handleKeyDown(e) {
    // Tab or enter with completions
    if (e.key == "Tab" || e.which == 13 || e.keyCode == 13) {
      if (autocomplete != "") {
        triggerCompletion({ feed: autocomplete });
        e.preventDefault();
        return;
      }

      if (selectedCompletion != null) {
        triggerCompletion(
          selectedCompletion,
          fieldPost != null ? fieldPost.length : 0
        );
        e.preventDefault();
        return;
      }
    }

    if (e.key == "Escape") {
      if (completions.length > 0) {
        escPressed = true;
        e.preventDefault();
        return;
      }
    }

    if (e.which == 13 || e.keyCode == 13) {
      // Search on enter
      emit.search();
      e.preventDefault();
      return;
    }

    handleCursor();

    // Prevent moving cursor to beginning/end
    if (processedCompletions.count > 0)
      if (processedCompletions.count > 0) {
        if (e.key == "ArrowUp") {
          e.preventDefault();
          if (completionIndex == null) {
            completionIndex = processedCompletions.count - 1;
          } else if (completionIndex > 0) {
            completionIndex--;
          } else {
            completionIndex = null;
          }
        } else if (e.key == "ArrowDown") {
          e.preventDefault();
          if (completionIndex == null) {
            completionIndex = 0;
          } else if (completionIndex < processedCompletions.count - 1) {
            completionIndex++;
          } else {
            completionIndex = null;
          }
        }
      }
  }

  function handleKeyUp(e) {
    handleCursor();
  }

  function fieldValid(text) {
    const fieldMatch = text.match(/^[^a-z]*([a-zA-Z0-9_-]+):(.*)$/);
    if (fieldMatch == null) return { valid: false };
    const field = fieldMatch[1];
    const value = fieldMatch[2];
    const id = extractSlugId(value);
    if (field == "project") {
      if (id == null) return { valid: false };
      if (example) return { valid: true, transform: `projects:${id}` };
      for (let i = 0; i < projects.projects.length; i++) {
        const project = projects.projects[i];
        if (project.id == id) {
          return { valid: true, transform: `projects:${id}` };
        }
      }
      return { valid: false };
    } else if (field == "user") {
      if (id == null) return { valid: false };
      if (example) return { valid: true, transform: `user:${id}` };
      for (let i = 0; i < orgsAndUsers.allUsers.length; i++) {
        const user = orgsAndUsers.allUsers[i];
        if (user.id == id) {
          return { valid: true, transform: `user:${id}` };
        }
      }
      return { valid: false };
    } else if (field == "organization") {
      if (id == null) return { valid: false };
      if (example) return { valid: true, transform: `organization:${id}` };
      for (let i = 0; i < orgsAndUsers.organizations.length; i++) {
        const org = orgsAndUsers.organizations[i];
        if (org.id == id) {
          return { valid: true, transform: `organization:${id}` };
        }
      }
      return { valid: false };
    } else {
      return { valid: true };
    }
  }

  function ensureValidity(highlights) {
    for (let i = 0; i < highlights.length; i++) {
      const highlight = highlights[i];
      if (highlight.type == "field") {
        highlights[i] = { ...fieldValid(highlight.text), ...highlight };
      }
    }
    return highlights;
  }

  $: highlights = ensureValidity(highlight(value), $projects, $orgsAndUsers);
  export let transformedQuery;
  $: transformedQuery = highlights
    .map(x => (x.transform != null ? x.transform : x.text))
    .join("");
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

    @media only screen and (max-width: $mobileBreak) {
      margin: 0 0 44px 0;
    }

    :global(svg) {
      position: absolute;
      pointer-events: none;
      padding: 13px 17px;
    }

    &.compact {
      :global(svg) {
        padding: 7px 17px;
      }
    }
  }

  textarea {
    -webkit-text-fill-color: transparent;
    outline: none;
    font-size: $fontSize;
    background: #f1f2f4;

    &.compact {
      min-height: 32px;
    }

    &:focus {
      background: white;
      border: solid 1px $viewerDarkGray;

      & + .mirror {
        .autocomplete {
          display: inline;
        }

        > .field > :global(span) {
          background: rgba(0, 0, 0, 0.03);
        }
      }

      & ~ .tagbank {
        display: block;
      }
    }
  }

  .mirror,
  textarea {
    line-height: 1.6;
    font-family: inherit;
    border: none;
    padding: 9px 12px 9px 49px;
    box-sizing: border-box;
    border: solid 1px transparent;
    width: 100%;
    height: 100%;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-spacing: $wordSpacing;

    &.compact {
      padding: 3px 12px 3px 49px;
    }
  }

  .mirror {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    height: calc(100% - 10px);
    pointer-events: none;
    color: black;
    -webkit-text-fill-color: black;

    &.compact {
      height: calc(100% - 7px);
    }

    word-spacing: 0;
    font-size: 0;

    > span {
      &.autocomplete {
        $autocompleteColor: rgba(0, 0, 0, 0.33);

        color: $autocompleteColor;
        -webkit-text-fill-color: $autocompleteColor;
        display: none;
      }

      > :global(span) {
        position: relative;
        font-size: $fontSize;
        word-spacing: $wordSpacing;

        :global(b) {
          font-weight: normal;
        }
      }

      &.field {
        position: relative;

        > :global(span) {
          $fieldColor: rgba(0, 0, 0, 0.8);

          border-radius: $radius;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.19);
          color: $fieldColor;
          -webkit-text-fill-color: $fieldColor;

          :global(b) {
            $keyColor: $searchSpecial;
            color: $keyColor;
            -webkit-text-fill-color: $keyColor;
          }
        }
      }
    }
  }

  .tagbank {
    display: none;
    position: absolute;
    background: white;
    padding: 10px 0 5px 0;
    z-index: 1;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.23);
    border-radius: $radius;
    margin-top: -4px;

    .completions {
      color: black;
      font-size: 16px;
      max-width: 450px;
      user-select: none;

      .completion {
        padding: 5px 15px;

        $activeColor: rgba(66, 148, 240, 0.15);

        &.groupstart {
          text-transform: uppercase;
          font-weight: bold;
          color: $gray;
          font-size: 11px;
        }

        .negative {
          color: $gray;
        }

        .info {
          color: $gray;
          font-size: 12px;
          margin-top: 2px;
          margin-bottom: 2px;
        }

        &.active {
          background: $activeColor;
        }
      }
    }
  }

  ::placeholder {
    color: rgba(0, 0, 0, 0.76);
    -webkit-text-fill-color: $gray;
  }
</style>

<div class="search" class:compact>
  {@html searchIconSvg}
  <textarea
    bind:this={input}
    bind:value
    disabled={example}
    class:compact
    placeholder="Search"
    use:textAreaResize={0}
    spellcheck="false"
    on:keydown={handleKeyDown}
    on:keyup={handleKeyUp}
    on:input={handleCursor}
    on:click={handleCursor}
    on:touchend={handleCursor}
    on:focus={handleCursor}
    on:blur={handleBlur} />
  <div class="mirror" bind:this={mirror} class:compact>
    {#each highlights as highlight}
      {#if highlight.type == 'field'}
        <span class:field={highlight.valid}>
          <NoWhitespace>
            <b>{highlight.field}</b>
            <span>{highlight.value}</span>
          </NoWhitespace>
        </span>
      {:else}
        {#each highlight.text.split(/( )/g) as rawText}
          <!-- Split raw text by space to avoid line-break issues -->
          {#if rawText != ''}
            <span>
              <span>{rawText}</span>
            </span>
          {/if}
        {/each}
      {/if}
    {/each}
    {#if autocomplete.length > 0}
      <span class="autocomplete">
        <span>{autocomplete}</span>
      </span>
    {/if}
  </div>
  <div class="tagbank" style={completionX}>
    <div class="completions">
      {#each processedCompletions.completions as completion}
        <div
          class="completion"
          class:active={completionIndex != null && completionIndex == completion.index}
          on:mouseover={() => {
            if (completion.index != null) completionIndex = completion.index;
          }}
          on:mouseout={() => {
            if (completion.index != null) completionIndex = null;
          }}
          on:mousedown|preventDefault={() => triggerCompletion(completion, fieldPost != null ? fieldPost.length : 0)}
          class:groupstart={completion.type == 'groupstart'}>
          <div
            class:negative={completion.score != null && completion.score < 0}>
            <div>
              <!-- Highlight completion letters -->
              {#each completion.text as letter, i}
                {#if completion.highlightLetters != null && completion.highlightLetters.includes(i)}
                  <b>{letter}</b>
                {:else}
                  <span>{letter}</span>
                {/if}
              {/each}
            </div>
          </div>
          {#if completion.info != null}
            <div class="info">{completion.info}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
