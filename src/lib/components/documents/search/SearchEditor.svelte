<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import type { Maybe } from "@/lib/api/types";

  interface ParserError {
    hasError: boolean;
    message: string;
    position: Maybe<number>;
  }

  // Create a store for the document structure
  const docStructure = writable({});
  const parserError = writable<ParserError>({
    hasError: false,
    message: "",
    position: undefined,
  });
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import {
    EditorState,
    Plugin,
    PluginKey,
    Transaction,
  } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import {
    Schema,
    DOMParser,
    type Node as ProseMirrorNode,
    Mark,
  } from "prosemirror-model";
  import { keymap } from "prosemirror-keymap";
  import { baseKeymap } from "prosemirror-commands";
  import { history, undo, redo } from "prosemirror-history";
  import { validateQuery } from "./parse";
  import { parseQuery, type ParsedNode, IMPLICIT } from "$lib/utils/search";
  import { Alert16, Stop16 } from "svelte-octicons";
  import Tooltip from "../../common/Tooltip.svelte";

  const dispatch = createEventDispatcher();

  // Set up the editor
  let editorRef: HTMLDivElement;
  let view: EditorView;

  // Receive the query as a prop
  export let initialQuery = "";
  // Track current query for external access
  let currentQuery = initialQuery;
  let queryWarning: string | null = null;
  // Track the query that had an error for recovery
  let errorQuery = "";
  // Track error recovery mode
  let isErrorRecoveryMode = false;

  // Helper function to update the document structure store
  function updateDocStructure() {
    if (view && view.state && view.state.doc) {
      $docStructure = view.state.doc.toJSON();
    }
  }

  function setParserError(message: string, position?: number) {
    $parserError = { hasError: true, message, position };
  }

  function clearParserError() {
    $parserError = { hasError: false, message: "", position: undefined };
  }

  // Create the ProseMirror schema
  const searchSchema = new Schema({
    nodes: {
      doc: {
        content: "block+",
      },
      paragraph: {
        content: "inline*",
        group: "block",
        parseDOM: [{ tag: "p" }],
        toDOM() {
          return ["p", 0];
        },
      },
      text: {
        group: "inline",
      },
      // textToken: {
      //   group: "inline",
      //   inline: true,
      //   attrs: {
      //     text: { default: "" },
      //     prefix: { default: null },
      //     quoted: { default: false },
      //     regex: { default: false },
      //   },
      //   parseDOM: [
      //     {
      //       tag: "span.search-text",
      //       getAttrs(dom) {
      //         if (!(dom instanceof HTMLElement)) return null;
      //         return {
      //           text: dom.getAttribute("data-text") || dom.textContent || "",
      //           prefix: dom.getAttribute("data-prefix"),
      //           quoted: dom.getAttribute("data-quoted") === "true",
      //           regex: dom.getAttribute("data-regex") === "true",
      //         };
      //       },
      //     },
      //   ],
      //   toDOM(node) {
      //     const attrs = {
      //       class: "search-text",
      //       "data-text": node.attrs.text,
      //     };
      //     if (node.attrs.prefix) attrs["data-prefix"] = node.attrs.prefix;
      //     if (node.attrs.quoted) attrs["data-quoted"] = "true";
      //     if (node.attrs.regex) attrs["data-regex"] = "true";

      //     // Render out the node's text
      //     let displayText = node.attrs.text;
      //     if (node.attrs.quoted) {
      //       displayText = `"${displayText}"`;
      //     }
      //     if (node.attrs.prefix) displayText += node.attrs.prefix;

      //     return ["span", attrs, displayText];
      //   },
      // },
      // Basic term
      term: {
        group: "inline",
        inline: true,
        atom: true,
        attrs: {
          value: { default: "" },
          field: { default: null },
          boost: { default: null },
          prefix: { default: null },
          quoted: { default: false },
        },
        parseDOM: [
          {
            tag: "span.search-term",
            getAttrs(dom) {
              if (!(dom instanceof HTMLElement)) return null;
              return {
                value: dom.getAttribute("data-value") || "",
                field: dom.getAttribute("data-field"),
                boost: dom.getAttribute("data-boost"),
                prefix: dom.getAttribute("data-prefix"),
                quoted: dom.getAttribute("data-quoted") === "true",
              };
            },
          },
        ],
        toDOM(node) {
          const attrs: any = {
            class: "search-term",
            "data-value": node.attrs.value,
          };

          if (node.attrs.field) attrs["data-field"] = node.attrs.field;
          if (node.attrs.boost) attrs["data-boost"] = node.attrs.boost;
          if (node.attrs.prefix) attrs["data-prefix"] = node.attrs.prefix;
          if (node.attrs.quoted) attrs["data-quoted"] = "true";

          let displayText = "";
          if (node.attrs.field) displayText += `${node.attrs.field}:`;
          if (node.attrs.prefix) displayText += node.attrs.prefix;

          if (node.attrs.quoted) {
            displayText += `"${node.attrs.value}"`;
          } else {
            displayText += node.attrs.value;
          }

          if (node.attrs.boost) displayText += `^${node.attrs.boost}`;

          return ["span", attrs, displayText];
        },
      },
      // Range node (e.g., date:[2020 TO 2021])
      range: {
        group: "inline",
        inline: true,
        atom: true,
        attrs: {
          field: { default: "" },
          lowerBound: { default: "" },
          upperBound: { default: "" },
          inclusive: { default: [true, true] },
        },
        parseDOM: [
          {
            tag: "span.search-range",
            getAttrs(dom) {
              if (!(dom instanceof HTMLElement)) return null;
              const inclusive = dom.getAttribute("data-inclusive");
              return {
                field: dom.getAttribute("data-field") || "",
                lowerBound: dom.getAttribute("data-lower") || "",
                upperBound: dom.getAttribute("data-upper") || "",
                inclusive: inclusive ? JSON.parse(inclusive) : [true, true],
              };
            },
          },
        ],
        toDOM(node) {
          const startBracket = node.attrs.inclusive[0] ? "[" : "{";
          const endBracket = node.attrs.inclusive[1] ? "]" : "}";
          const displayText = `${node.attrs.field}:${startBracket}${node.attrs.lowerBound || ""} TO ${node.attrs.upperBound || ""}${endBracket}`;

          return [
            "span",
            {
              class: "search-range",
              "data-field": node.attrs.field,
              "data-lower": node.attrs.lowerBound,
              "data-upper": node.attrs.upperBound,
              "data-inclusive": JSON.stringify(node.attrs.inclusive),
            },
            displayText,
          ];
        },
      },
      // Operator node (AND, OR, NOT)
      operator: {
        group: "inline",
        inline: true,
        atom: true,
        attrs: {
          value: { default: "" },
        },
        parseDOM: [
          {
            tag: "span.search-operator",
            getAttrs(dom) {
              if (!(dom instanceof HTMLElement)) return null;
              return {
                value: dom.getAttribute("data-value") || "",
              };
            },
          },
        ],
        toDOM(node) {
          // Only for explicit operators
          return [
            "span",
            {
              class: "search-operator",
              "data-value": node.attrs.value,
            },
            node.attrs.value,
          ];
        },
      },
    },
    marks: {
      textToken: {
        attrs: {
          quoted: { default: false },
          regex: { default: false },
          prefix: { default: null },
        },
        parseDOM: [
          {
            tag: "span.search-text",
            getAttrs(dom) {
              if (!(dom instanceof HTMLElement)) return null;
              return {
                quoted: dom.getAttribute("data-quoted") === "true",
                regex: dom.getAttribute("data-regex") === "true",
                prefix: dom.getAttribute("data-prefix"),
              };
            },
          },
        ],
        toDOM(mark) {
          const attrs: any = {
            class: "search-text",
          };
          if (mark.attrs.prefix) attrs["data-prefix"] = mark.attrs.prefix;
          if (mark.attrs.quoted) attrs["data-quoted"] = "true";
          if (mark.attrs.regex) attrs["data-regex"] = "true";

          return ["span", attrs, 0];
        },
      },
    },
  });

  // Convert ParsedNode to ProseMirror nodes
  function parsedNodeToPM(parsedNode: ParsedNode): ProseMirrorNode[] {
    if (parsedNode.type === "text") {
      // For text, create a text node with a textToken mark
      let text = parsedNode.text;
      // Apply quotation marks for display if quoted
      if (parsedNode.quoted) {
        text = `"${text}"`;
      }
      // Apply prefix if present
      if (parsedNode.prefix) {
        text += parsedNode.prefix;
      }
      // Create text node with appropriate mark
      let mark: Mark[] | null = null;
      if (parsedNode.quoted || parsedNode.regex || parsedNode.prefix) {
        mark = [
          searchSchema.mark("textToken", {
            quoted: parsedNode.quoted,
            regex: parsedNode.regex,
            prefix: parsedNode.prefix,
          }),
        ];
      }
      return [searchSchema.text(text, mark)];
    }

    if (parsedNode.type === "term") {
      return [
        searchSchema.nodes.term.create({
          value: parsedNode.value,
          field: parsedNode.field,
          boost: parsedNode.boost,
          prefix: parsedNode.prefix,
          quoted: parsedNode.quoted,
        }),
      ];
    }

    if (parsedNode.type === "range") {
      return [
        searchSchema.nodes.range.create({
          field: parsedNode.field,
          lowerBound: parsedNode.lowerBound,
          upperBound: parsedNode.upperBound,
          inclusive: parsedNode.inclusive,
        }),
      ];
    }

    if (parsedNode.type === "expression") {
      const result = parsedNodeToPM(parsedNode.left);

      if (parsedNode.operator && parsedNode.right) {
        if (parsedNode.operator === IMPLICIT) {
          // Implicit operators are just space characters
          result.push(searchSchema.text(" "));
        } else {
          // Explicit operators are nodes
          result.push(
            searchSchema.nodes.operator.create({
              value: parsedNode.operator,
            }),
          );
        }

        result.push(...parsedNodeToPM(parsedNode.right));
      }

      return result;
    }

    return [];
  }

  // Convert a ProseMirror document to a Lucene query string
  // CONSIDER CONVERTING PROSEMIRROR NODES TO LUCENE AST NODES, THEN CALLING toString
  function pmDocToQueryString(doc: ProseMirrorNode): string {
    // Clear previous errors
    if (!isErrorRecoveryMode) {
      clearParserError();
    }

    try {
      let query = "";

      doc.descendants((node) => {
        if (node.isText) {
          query += node.text;
          return false;
        }

        if (node.type.name === "term") {
          const { field, value, boost, prefix, quoted } = node.attrs;

          if (field) query += `${field}:`;
          if (prefix) query += prefix;

          if (quoted) {
            query += `"${value}"`;
          } else {
            query += value;
          }

          if (boost) query += `^${boost}`;

          return false;
        }

        if (node.type.name === "range") {
          const { field, lowerBound, upperBound, inclusive } = node.attrs;
          const start = inclusive[0] ? "[" : "{";
          const end = inclusive[1] ? "]" : "}";

          query += `${field}:${start}${lowerBound || ""} TO ${upperBound || ""}${end}`;

          return false;
        }

        if (node.type.name === "operator") {
          query += ` ${node.attrs.value} `; // Explicit operators with spaces
          return false;
        }

        return true;
      });

      return query;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error converting document to query";
      setParserError(errorMessage);
      return "";
    }
  }

  // Create a new document from a query string
  function createDocFromQuery(query: string): ProseMirrorNode {
    // Clear previous warnings/errors first
    queryWarning = null;
    if (!isErrorRecoveryMode) {
      clearParserError();
    }

    // Check for warnings even if the query is valid
    const warning = checkQueryWarnings(query);
    if (warning) {
      queryWarning = warning;
    }

    // // Check for validation errors
    // const validation = validateQuery(query);
    // if (!validation.isValid && !isErrorRecoveryMode) {
    //   setParserError(
    //     validation.error || "Invalid query syntax",
    //     validation.position,
    //   );
    // }

    // For empty queries, return an empty document
    if (!query || !query.trim()) {
      return searchSchema.node("doc", {}, [
        searchSchema.node("paragraph", {}, []),
      ]);
    }

    // If we're in error recovery mode, create a simple text document
    if (isErrorRecoveryMode) {
      return searchSchema.node("doc", {}, [
        searchSchema.node("paragraph", {}, [searchSchema.text(query)]),
      ]);
    }

    // If we got here, try to parse and process the query
    try {
      const parsedNode = parseQuery(query);
      const paragraphContent = parsedNodeToPM(parsedNode);

      return searchSchema.node("doc", {}, [
        searchSchema.node("paragraph", {}, paragraphContent),
      ]);
    } catch (error) {
      // Console
      console.error("Error parsing query:", error);
      // Update store
      const errorMessage =
        error instanceof Error ? error.message : "Error parsing query";

      if (!isErrorRecoveryMode) {
        setParserError(errorMessage);
        enterErrorRecoveryMode(query);
      }

      // Return plain text in error recovery mode
      return searchSchema.node("doc", {}, [
        searchSchema.node("paragraph", {}, [searchSchema.text(query)]),
      ]);
    }
  }

  // Plugin to track changes and update the query
  const queryTrackingPluginKey = new PluginKey("queryTracking");
  const queryTrackingPlugin = new Plugin({
    key: queryTrackingPluginKey,
    state: {
      init() {
        return { query: initialQuery };
      },
      apply(tr, value) {
        if (tr.docChanged) {
          const newQuery = pmDocToQueryString(tr.doc);
          return { query: newQuery };
        }
        return value;
      },
    },
    view() {
      return {
        update(view, prevState) {
          const pluginState = queryTrackingPluginKey.getState(view.state);
          if (pluginState.query !== currentQuery) {
            currentQuery = pluginState.query;
            // Check for warnings on each query change
            queryWarning = checkQueryWarnings(currentQuery);
            dispatch("queryChange", { query: currentQuery });
          }
        },
      };
    },
  });

  // Plugin to ensure mark boundaries are maintained
  const markBoundaryPlugin = new Plugin({
    key: new PluginKey("markBoundary"),

    // This runs after a transaction but before it's applied to create the new state
    appendTransaction(transactions, oldState, newState) {
      // Only proceed if content changed
      if (!transactions.some((tr) => tr.docChanged)) return null;

      let tr: Transaction | null = null;
      let modified = false;

      // Split on closing quotes
      function splitOnQuotations(node: ProseMirrorNode, pos: number) {
        // Check if this node has the textToken mark with quoted=true
        const quotedMark = node.marks.find(
          (m) => m.type.name === "textToken" && m.attrs.quoted,
        );
        if (!quotedMark || !node.text) return;

        // Start by finding a balanced pair of quotes
        let quoteStartPos = -1;
        let quoteEndPos = -1;
        let inQuote = false;

        for (let i = 0; i < node.text.length; i++) {
          if (node.text[i] === '"') {
            if (!inQuote) {
              // We've entered a quoted string
              quoteStartPos = i;
              inQuote = true;
            } else {
              // We are existing a quoted string
              quoteEndPos = i;
              inQuote = false;

              // If there's content after the closing quote, we need to split
              if (quoteEndPos < node.text.length - 1) {
                if (!tr) tr = newState.tr;
                let textAfter = node.text.substring(quoteEndPos + 1);

                // Delete the text after the quotes
                tr.delete(pos + quoteEndPos, pos + node.text.length);

                // Insert a space before, unless the character already starts with a space
                if (!textAfter.startsWith(" ")) {
                  textAfter = " " + textAfter;
                }
                // Create a new text node without the quoted mark
                const newTextNode = newState.schema.text(textAfter);

                // Insert at the position of the closing quote
                tr.insert(pos + quoteEndPos, newTextNode);

                modified = true;

                // We've handled this split, so break out of the loop
                break;
              }
            }
          }
        }
      }

      // Helper function to process text nodes
      function processTextNode(node: ProseMirrorNode, pos: number) {
        splitOnQuotations(node, pos);
      }

      // Process a node and its children recursively
      function processNode(node: ProseMirrorNode, pos: number) {
        // If this is a text node, process it
        if (node.isText) {
          processTextNode(node, pos);
          return;
        }

        // If this node has content, process each child
        if (node.content && node.content.size > 0) {
          // Process each child node
          let childPos = pos + 1; // +1 to account for the node's opening tag

          node.content.forEach((childNode, offset) => {
            // Process this child
            processNode(childNode, childPos);
            // Move position past this child
            childPos += childNode.nodeSize;
          });
        }
      }

      // Start processing from the root node
      processNode(newState.doc, 0);

      return modified ? tr : null;
    },
  });

  function checkQueryWarnings(query: string): string | null {
    // No warnings for empty queries
    if (!query || !query.trim()) return null;

    // Check for potentially problematic patterns
    if (query.includes("AND") && query.includes("OR") && !query.includes("(")) {
      return "Mixed AND/OR operators without parentheses may lead to unexpected results";
    }

    if ((query.match(/\*/g) || []).length > 2) {
      return "Multiple wildcards may result in slow searches";
    }

    return null;
  }

  // Function to enter error recovery mode
  function enterErrorRecoveryMode(query: string) {
    isErrorRecoveryMode = true;
    errorQuery = query;
    console.log("Entered error recovery mode with query:", query);
  }

  // Function to exit error recovery mode
  function exitErrorRecoveryMode() {
    if (!isErrorRecoveryMode) return;

    console.log("Exiting error recovery mode");
    isErrorRecoveryMode = false;

    // Reinitialize the editor with structured nodes
    if (view) {
      try {
        // Attempt to reparse the current query
        const currentQuery = pmDocToQueryString(view.state.doc);
        const doc = createDocFromQuery(currentQuery);
        view.dispatch(
          view.state.tr.replaceWith(
            0,
            view.state.doc.content.size,
            doc.content,
          ),
        );
        console.log("Successfully rebuilt editor after error recovery");
      } catch (e) {
        console.error("Failed to rebuild editor after error recovery:", e);
      }
    }
  }

  // Subscribe to the parser error store to handle transitions between modes
  const unsubscribeParserError = parserError.subscribe(($error) => {
    if ($error.hasError && !isErrorRecoveryMode) {
      enterErrorRecoveryMode(currentQuery);
    } else if (!$error.hasError && isErrorRecoveryMode) {
      exitErrorRecoveryMode();
    }
  });

  onMount(() => {
    // Initialize ProseMirror
    const state = EditorState.create({
      schema: searchSchema,
      doc: createDocFromQuery(initialQuery),
      plugins: [
        history(),
        keymap({
          "Mod-z": undo,
          "Mod-y": redo,
          "Mod-Shift-z": redo,
        }),
        keymap(baseKeymap),
        queryTrackingPlugin,
        markBoundaryPlugin,
      ],
    });

    view = new EditorView(editorRef, {
      state,
      dispatchTransaction(transaction) {
        const newState = view.state.apply(transaction);
        view.updateState(newState);
        // Update the document structure store if the document changed
        if (transaction.docChanged) {
          updateDocStructure();
          // Attempt to validate the query
          if (isErrorRecoveryMode) {
            const currentQuery = pmDocToQueryString(newState.doc);
            const validation = validateQuery(currentQuery);

            // If valid, attempt to exit error recovery mode
            if (validation.isValid) {
              clearParserError();
            }
          }
        }
      },
    });

    // Initialize document structure
    updateDocStructure();

    // Set initial query for the tracking plugin
    if (initialQuery) {
      // Initialize the plugin state with the initial query
      const pluginState = queryTrackingPluginKey.getState(view.state);
      if (pluginState.query !== initialQuery) {
        currentQuery = initialQuery;
        dispatch("queryChange", { query: currentQuery });
      }
    }
  });

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
    // Clean up subscription
    if (unsubscribeParserError) {
      unsubscribeParserError();
    }
  });

  // Public method to update the editor with a new query
  export function updateQuery(query: string) {
    if (!view) return;

    // Clear previous errors/warnings
    if (!isErrorRecoveryMode) {
      clearParserError();
      queryWarning = null;
    }

    // Check for warnings
    const warning = checkQueryWarnings(query);
    if (warning) {
      queryWarning = warning;
    }

    try {
      const doc = createDocFromQuery(query);
      view.dispatch(
        view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content),
      );
    } catch (error) {
      if (!isErrorRecoveryMode) {
        const errorMessage =
          error instanceof Error ? error.message : "Error updating query";
        setParserError(errorMessage);
      }
    }
  }

  // Public method to get the current query
  export function getQuery(): string {
    return currentQuery;
  }
</script>

<div class="search-editor-container">
  <div bind:this={editorRef} class="prosemirror-editor"></div>
  {#if $parserError.hasError}
    <div class="error-message">
      <Tooltip caption={$parserError.message}>
        <Stop16 />
      </Tooltip>
    </div>
  {/if}
  {#if queryWarning}
    <div class="warning-message">
      <Tooltip caption={queryWarning}>
        <Alert16 />
      </Tooltip>
    </div>
  {/if}
  {#if view}
    <div class="debug-panel">
      <details open>
        <summary>Debug Information</summary>
        <button on:click={updateDocStructure}> Refresh Doc View </button>
        <div class="debug-section">
          <h4>Initial Query</h4>
          <pre>{initialQuery}</pre>
        </div>

        <div class="debug-section">
          <h4>Current Query</h4>
          <pre>{currentQuery}</pre>
        </div>

        <div class="debug-section">
          <h4>Warnings</h4>
          <pre>{queryWarning || "No warnings"}</pre>
          <h4>Error Recovery Mode</h4>
          <pre>{isErrorRecoveryMode}</pre>
          <h4>Parsing Error</h4>
          <pre>{JSON.stringify($parserError, null, 2)}</pre>
        </div>

        <div class="debug-section">
          <h4>Parsed Query Structure</h4>
          <pre>{JSON.stringify(parseQuery(currentQuery), null, 2)}</pre>
        </div>

        <div class="debug-section">
          <h4>Document Structure</h4>
          <pre>{JSON.stringify($docStructure, null, 2)}</pre>
        </div>

        <div class="debug-section">
          <h4>Selection</h4>
          <pre>From: {view.state.selection.from}, To: {view.state.selection
              .to}</pre>
        </div>
      </details>
    </div>
  {/if}
</div>

<style>
  .search-editor-container {
    min-width: 32rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
  }

  .prosemirror-editor {
    padding: 10px;
    min-height: 36px;
  }

  /* ProseMirror content styling */
  :global(.ProseMirror) {
    outline: none;
  }

  :global(.ProseMirror p) {
    margin: 0;
  }

  :global(.search-text) {
    background-color: transparent;
    border-radius: 3px;
  }
  :global(.search-text[data-quoted]) {
    background-color: #eee;
    padding: 2px 4px;
    padding: 0;
  }

  :global(.search-term) {
    background-color: #e6f7ff;
    border-radius: 3px;
    padding: 2px 4px;
    margin: 0 2px;
    white-space: nowrap;
  }

  :global(.search-range) {
    background-color: #f0f7ff;
    border-radius: 3px;
    padding: 2px 4px;
    margin: 0 2px;
    white-space: nowrap;
  }

  :global(.search-operator) {
    font-family: var(--font-mono);
    font-size: var(--font-sm);
    background-color: #fff1f0;
    border-radius: 3px;
    padding: 2px 4px;
    margin: 0 2px;
    font-weight: bold;
    white-space: nowrap;
  }

  :global(.search-operator.implicit) {
    background-color: transparent;
    padding: 0;
    margin: 0;
    font-weight: normal;
    min-width: 6px; /* Ensure it's selectable/visible */
  }

  .error-message {
    fill: var(--red-3);
  }
  .warning-message {
    fill: var(--orange-3);
  }

  /* Debug panel styles */
  .debug-panel {
    margin-top: 10px;
    border-top: 1px dashed #ccc;
    padding-top: 10px;
    font-family: monospace;
    font-size: 12px;
  }

  .debug-section {
    margin-bottom: 12px;
  }

  .debug-section h4 {
    margin: 0 0 4px 0;
    font-size: 13px;
  }

  pre {
    background-color: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
  }
</style>
