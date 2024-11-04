<script lang="ts">
  import { onMount } from "svelte";
  import { APP_URL } from "@/config/config.js";

  import Logo from "$lib/components/common/Logo.svelte";
  import { renderMarkdown } from "$lib/utils/markdown";

  export let content: string;

  $: markdownContent = renderMarkdown(content);

  interface Heading {
    text: string;
    id: string;
    level: number;
  }

  let contentElem: HTMLElement;
  let sidebarElem: HTMLDivElement;
  let headers: Heading[];

  onMount(() => {
    headers = injectLinkReferences();
    buildToc(headers);
  });

  function injectLinkReferences() {
    if (!contentElem) {
      console.warn("No content element");
      return [];
    }

    const headers = contentElem.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const contents: Heading[] = [];
    headers.forEach((header, i) => {
      contents.push({
        text: header.textContent?.trim() ?? "",
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
  function buildToc(headers: Heading[]) {
    let root = { children: [] };

    const addNode = (node: Node, level: number, tree: HTMLElement) => {
      if (level === 1) {
        // @ts-expect-error
        tree.children.push({
          node,
          children: [],
        });
        return;
      }
      if (tree.children.length === 0) {
        const newNode: HTMLElement = {
          node: null,
          // @ts-expect-error
          children: [],
        };
        // @ts-expect-error
        tree.children.push(newNode);
        return addNode(node, level - 1, newNode);
      } else {
        return addNode(
          node,
          level - 1,
          tree.children[tree.children.length - 1] as HTMLElement,
        );
      }
    };

    headers.forEach((header) => {
      // @ts-expect-error
      addNode({ text: header.text, id: header.id }, header.level, root);
    });

    // Strip single TOC root items
    while (root.children.length === 1) {
      root = root.children[0] ?? { children: [] };
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

<article class="page">
  <header>
    <div class="logo">
      <a href={APP_URL}>
        <Logo />
      </a>
    </div>
  </header>
  <nav class="toccontainer">
    <div class="toc" bind:this={sidebarElem} />
  </nav>
  <main class="content" bind:this={contentElem}>
    {@html markdownContent}
  </main>
</article>

<style>
  article {
    width: 100%;
    min-width: 0;
    max-width: 64rem;
    margin: 0 auto;
    padding: 1rem;
    position: relative;
  }
  header {
    padding: 1rem;
    border-bottom: 1px solid var(--gray-2);
  }
  nav {
    float: right;
    padding: 2rem;
    min-width: 16rem;
  }
  main {
    max-width: 48rem;
    padding: 1rem;
  }

  @media (max-width: 36rem) {
    nav {
      display: block;
      width: 100%;
      padding: 1rem;
    }
  }

  .logo a {
    display: block;
  }
  :global(.logo a .icon) {
    height: 2rem;
    width: auto;
  }

  :global(.page .toccontainer .toc ul) {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  :global(.page .toccontainer .toc ul) :global(.page .toccontainer .toc ul) {
    padding-inline-start: 1rem;
  }

  :global(.page .toccontainer .toc li) {
    list-style: none;
    margin: 0.8em 0;
  }

  @media only screen and (max-width: 720px) {
    :global(.page .toccontainer .toc li .deep) {
      display: none;
    }
  }

  :global(.hiddenanchor) {
    visibility: hidden;
  }

  :global(*:hover > .hiddenanchor) {
    visibility: visible;
  }

  :global(.page .content > *) {
    display: block;
    width: auto;
  }

  :global(.page .content ul) {
    margin-bottom: 1rem;
    padding-left: 1rem;
  }

  :global(.page .content li) {
    margin: 1rem;
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
  }
  :global(pre code) {
    background: none;
    padding: 0;
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

  :global(p) {
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  :global(h1, h2, h3) {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
</style>
