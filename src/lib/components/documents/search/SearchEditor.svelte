<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorState } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import {
    Schema,
    DOMParser,
    type Node as ProseMirrorNode,
  } from "prosemirror-model";
  import { schema } from "prosemirror-schema-basic";
  import { parse, type AST, type Node as LuceneNode } from "lucene";
  import { isNodeTerm, isAST, isBinaryAST } from "$lib/utils/search";

  // Create the ProseMirror schema
  const searchSchema = new Schema({
    nodes: {
      doc: {
        content: "inline*",
      },
      text: {
        group: "inline",
      },
      term: {
        group: "inline",
        inline: true,
        atom: true,
        attrs: { value: { default: "" } },
        toDOM: (node) => [
          "span",
          {
            class: "search-term",
            "data-value": node.attrs.value,
          },
          node.attrs.value,
        ],
      },
    },
    marks: schema.spec.marks,
  });

  // Set up the editor
  let editorRef: HTMLDivElement;
  let view: EditorView;

  // Receive the query as a prop
  export let query = "";

  // Generate Lucene AST from query
  export function getAST(query: string): AST | LuceneNode {
    try {
      return parse(query);
    } catch (error) {
      console.error("Failed to parse query:", error);
      return {
        type: "term",
        value: query,
        quoted: false,
      } as unknown as LuceneNode;
    }
  }

  // Simple conversion for now - we'll expand this later
  function astToDoc(ast: AST | LuceneNode) {
    const content: ProseMirrorNode[] = [];

    if (isNodeTerm(ast)) {
      content.push(searchSchema.nodes.term.create({ value: ast.term }));
    } else if (isAST(ast)) {
      // For now, just concatenate terms
      const textContent = extractTextFromAST(ast);
      content.push(searchSchema.nodes.term.create({ value: textContent }));
    }

    return searchSchema.node("doc", {}, content);
  }

  // Basic walk of the tree, concatenating terms
  function extractTextFromAST(ast: AST | LuceneNode): string {
    if (isNodeTerm(ast)) {
      return `${ast.field}:${ast.term}` || "";
    }

    let text = "";
    if ("left" in ast && ast.left) {
      text += extractTextFromAST(ast.left);
    }

    if ("operator" in ast && ast.operator) {
      text += ` ${ast.operator} `;
    }

    if ("right" in ast && ast.right) {
      text += extractTextFromAST(ast.right);
    }

    return text;
  }

  onMount(() => {
    // Initialize ProseMirror
    const state = EditorState.create({
      schema: searchSchema,
      doc: searchSchema.node("doc", {}, [searchSchema.text(query)]),
    });

    view = new EditorView(editorRef, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);

        // Extract content to send to Solr
        const fragment = newState.doc.content;
        query = "";
        fragment.forEach((node) => {
          if (node.type.name === "text") {
            query += node.text;
          } else if (node.type.name === "term") {
            query += node.attrs.value;
          }
        });

        console.log("Current query:", query);
        console.log("AST:", getAST(query));
      },
    });
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });

  // Function to update the editor with a parsed query
  export function updateWithQuery(query: string) {
    const ast = getAST(query);
    const doc = astToDoc(ast);

    view.dispatch(
      view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content),
    );
  }
</script>

<div class="search-editor">
  <div bind:this={editorRef} class="editor"></div>
  <div class="current-query">
    <strong>Query:</strong>
    {query}
  </div>
</div>

<style>
  .search-editor {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    margin-bottom: 16px;
  }

  .editor {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 8px;
    min-height: 100px;
  }

  .current-query {
    margin-top: 8px;
    font-size: 0.9em;
    color: #555;
  }
</style>
