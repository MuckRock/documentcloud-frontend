<script>
  import Link from "@/router/Link";
  import { onMount, onDestroy } from "svelte";

  // SVG assets
  import mastLogoSvg from "@/assets/mastlogo.svg";

  export let content;
  let contentElem = null;

  function navTo(hash, smooth = false) {
    const elem = document.querySelector(hash);
    if (elem != null) {
      if (elem.scrollIntoView) {
        elem.scrollIntoView({
          block: "start",
          behavior: smooth ? "smooth" : "auto"
        });
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  function injectLinkReferences() {
    if (!contentElem) return;

    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const contents = [];
    headers.forEach(header => {
      contents.push({
        text: header.textContent.trim(),
        level: parseInt(header.tagName.substr(1))
      });
      let id = header.id;
      if (id == null) return;
      id = id.trim();
      if (id == "") return;
      const anchor = document.createElement("a");
      anchor.href = `#${id}`;
      anchor.textContent = " #";
      anchor.className = "hiddenanchor";
      header.appendChild(anchor);
    });
    return contents;
  }

  // Build table of contents
  function buildToc(headers) {
    // TODO: implement
  }

  onMount(async () => {
    if (location.hash.startsWith("#")) {
      if (!navTo(location.hash)) {
        location.replace(location.hash);
      }
    }
    // Make scrolling to hashes smooth
    document.documentElement.style.scrollBehavior = "smooth";
    const headers = injectLinkReferences();
    buildToc(headers);
  });

  onDestroy(() => {
    // Dismantle smooth anchor jumps
    document.documentElement.style.scrollBehavior = "auto";
  });
</script>

<style lang="scss">
  .page {
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 20px;

    :global(a) {
      color: $primary;
    }

    .content {
      padding: 20px 0;
      margin: 20px 0;
      border-top: solid 1px gainsboro;
      font-size: 16px;

      // Inspired by https://github.com/alex-shpak/hugo-book

      :global(h1),
      :global(h2),
      :global(h3),
      :global(h4),
      :global(h5),
      :global(h6) {
        font-weight: normal;

        :global(.hiddenanchor) {
          visibility: hidden;
        }

        &:hover {
          :global(.hiddenanchor) {
            visibility: visible;
          }
        }
      }

      :global(h1) {
        font-size: 32px;
      }

      :global(h2) {
        font-size: 24px;
      }

      :global(code) {
        padding: 0 0.25rem;
        background: #e9ecef;
        border-radius: 0.25rem;
        font-size: 0.925em;
      }

      :global(a) {
        color: $primary;
      }

      :global(pre) {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 0.25rem;
        overflow-x: auto;

        :global(code) {
          background: none;
          padding: 0;
        }
      }
    }
  }
</style>

<div class="page">
  <header>
    <div class="logo">
      <Link to="app">
        {@html mastLogoSvg}
      </Link>
    </div>
  </header>
  <div class="content" bind:this={contentElem}>
    {@html content}
  </div>
</div>
