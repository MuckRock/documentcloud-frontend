<script>
  import { onMount } from "svelte";
  import { APP_URL } from "@/config/config.js";

  // SVG assets
  import mastLogoSvg from "@/assets/mastlogo.svg?raw";

  /** @type {import('./$types').PageData} */
  export let data;

  let contentElem;
  let sidebarElem;
  let headers;

  onMount(() => {
    headers = injectLinkReferences();
    buildToc(headers);
  });

  function injectLinkReferences() {
    if (!contentElem) {
      console.warn("No content element");
      return;
    }

    const headers = contentElem.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const contents = [];
    headers.forEach((header, i) => {
      contents.push({
        text: header.textContent.trim(),
        id: header.id,
        level: parseInt(header.tagName.substring(1)),
      });
      let id = header.id;
      id = id.trim();
      if (!id) return;

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
    let root = { children: [] };

    const addNode = (node, level, tree) => {
      if (level === 1) {
        tree.children.push({
          node,
          children: [],
        });
        return;
      }
      if (tree.children.length === 0) {
        const newNode = {
          node: null,
          children: [],
        };
        tree.children.push(newNode);
        return addNode(node, level - 1, newNode);
      } else {
        return addNode(
          node,
          level - 1,
          tree.children[tree.children.length - 1],
        );
      }
    };

    headers.forEach((header) => {
      addNode({ text: header.text, id: header.id }, header.level, root);
    });

    // Strip single TOC root items
    while (root.children.length === 1) {
      root = root.children[0];
    }

    function generateToc(tree, depth = 0, first = true) {
      if (tree.children.length === 0 || depth >= 2) return null;
      const ul = document.createElement("ul");
      tree.children.forEach((child) => {
        const li = document.createElement("li");
        li.className = first ? "" : "deep";
        if (child.node != null) {
          const a = document.createElement("a");
          a.textContent = child.node.text;
          a.href = `#${child.node.id}`;
          li.appendChild(a);
        }
        const subToc = generateToc(child, depth + 1, false);
        if (subToc != null) li.appendChild(subToc);
        ul.appendChild(li);
      });
      return ul;
    }

    const toc = generateToc(root);

    if (toc !== null) {
      sidebarElem.appendChild(toc);
    }
  }
</script>

<svelte:head>
  <title>{data.title} | DocumentCloud</title>
</svelte:head>

<div class="page">
  <header>
    <div class="logo">
      <a href={APP_URL}>
        {@html mastLogoSvg}
      </a>
    </div>
  </header>
  <div class="content" bind:this={contentElem}>
    <div class="toccontainer">
      <div class="toc" bind:this={sidebarElem} />
    </div>

    {@html data.content}
  </div>
</div>

<style lang="scss">
  .page {
    --contentWidth: 720px;
    --tocWidth: 200px;
    --tocPaddingRight: 10px;
    --tocPaddingLeft: 30px;
    --tocFinalWidth: calc(--tocWidth + --tocPaddingLeft + --tocPaddingRight);

    max-width: calc(var(--contentWidth) + var(--tocFinalWidth));
    margin: 0 auto;
    box-sizing: border-box;
    padding: 40px 20px;
  }

  .page :global(a) {
    color: var(--primary, #4294f0);
  }

  .page .toccontainer {
    position: absolute;
    left: 100%;
    width: var(--tocWidth);
    padding: 40px var(--tocPaddingRight) 40px var(--tocPaddingLeft);
    top: 0;
    bottom: 0;
  }

  @media only screen and (max-width: 720px) {
    .page .toccontainer {
      position: relative;
      left: inherit;
      width: inherit;
      padding: 0;
      padding-right: 10px;
    }
  }

  .page .toccontainer .toc {
    font-size: 14px;
    position: sticky;
    top: 20px;
    overflow: auto;
    height: calc(100vh - 40px);

    @media only screen and (max-width: 720px) {
      position: relative;
      height: inherit;
      top: 0;
      overflow: none;

      background: rgba(var(--primary, #4294f0), 0.05);
      border: solid 1px var(--primary, #4294f0);
      padding: 0px 14px;
      box-sizing: border-box;
      border-radius: 3px;
    }

    :global(ul) {
      padding: 0;
      margin: 0;
      list-style: none;
    }

    :global(ul) :global(ul) {
      padding-inline-start: 1rem;
    }

    :global(li) {
      list-style: none;
      margin: 0.8em 0;

      @media only screen and (max-width: 720px) {
        :global(.deep) {
          display: none;
        }
      }
    }
  }

  .page .content {
    max-width: calc(100% - 240px);
    padding: 20px 0;
    margin: 20px 0;
    border-top: solid 1px gainsboro;
    font-size: 16px;
    position: relative;

    @media only screen and (max-width: 720px) {
      max-width: 100%;
    }

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

    :global(h5),
    :global(h6) {
      font-weight: bold;
    }

    :global(h1) {
      font-size: 32px;
    }

    :global(h2) {
      font-size: 24px;
    }

    :global(h3) {
      font-size: 20px;
    }

    :global(h4) {
      font-size: 18px;
    }

    :global(code) {
      padding: 0 0.25rem;
      background: #e9ecef;
      border-radius: 0.25rem;
      font-size: 0.925em;
    }

    :global(a) {
      color: var(--primary, #4294f0);
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

    :global(table) {
      border-spacing: 0;
      border-collapse: collapse;
    }

    :global(td),
    :global(th) {
      border: solid 1px #d1d6dc;
      padding: 6px 12px;
      vertical-align: middle;
    }

    :global(summary) {
      outline: none;
      cursor: pointer;
    }
  }
</style>
