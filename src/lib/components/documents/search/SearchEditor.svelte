<script lang="ts" context="module">
  import { writable } from "svelte/store";
  import type { Maybe } from "@/lib/api/types";

  export interface ParsedText {
    type: "text";
    text: string;
    quoted: boolean;
    regex: boolean;
    boost?: number;
    prefix?: string;
  }

  export interface ParsedTerm {
    type: "term";
    value: string;
    field?: string;
    boost?: number;
    prefix?: string;
    quoted: boolean;
  }

  export interface ParsedRange {
    type: "range";
    field: string;
    lowerBound?: string;
    upperBound?: string;
    inclusive: [boolean, boolean];
  }

  export interface ParsedExpression {
    type: "expression";
    operator?: string;
    left: ParsedNode;
    right?: ParsedNode;
  }

  export type ParsedNode =
    | ParsedText
    | ParsedTerm
    | ParsedRange
    | ParsedExpression;

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
  import { parse, type AST, type Node } from "lucene";
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import {
    EditorState,
    Plugin,
    PluginKey,
    TextSelection,
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
  import { Alert16, Search16, Stop16 } from "svelte-octicons";
  import Tooltip from "../../common/Tooltip.svelte";
  import Button from "../../common/Button.svelte";

  import { autocompletePlugin } from "./plugins/autocomplete";
  import "./plugins/autocomplete.css";

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
      implicitTerm: {
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
      implicitOperator: {
        attrs: {},
        parseDOM: [
          {
            tag: "span.implicit-operator",
          },
        ],
        toDOM() {
          return ["span", { class: "implicit-operator" }, 0];
        },
      },
    },
  });

  const IMPLICIT = "<implicit>";

  /* We process the AST into our own intermediate ParsedNode format.
   * This provides us stronger typing and more control over the structure.
   * The intermediate format also provides a layer of abstraction, so that
   * if we replace Lucene with another AST in the future, we only have to
   * modify this file. (TODO: Stricter typing on incoming node as AST)
   */
  function processNode(node: any): ParsedNode {
    if (!node) return { type: "term", value: "", quoted: false };

    // Handle raw nodes
    if (node.field === IMPLICIT) {
      return {
        type: "text",
        text: node.term,
        quoted: node.quoted,
        regex: node.regex,
        prefix: node.prefix,
        boost: node.boost,
      };
    }

    // Handle range nodes
    if ("term_min" in node && "term_max" in node) {
      return {
        type: "range",
        field: node.field || "",
        lowerBound: node.term_min,
        upperBound: node.term_max,
        inclusive: [
          node.inclusive_min !== undefined ? node.inclusive_min : true,
          node.inclusive_max !== undefined ? node.inclusive_max : true,
        ],
      };
    }

    // Handle term nodes
    if ("term" in node) {
      return {
        type: "term",
        value: node.term || "",
        field: node.field,
        boost: node.boost,
        prefix: node.prefix,
        quoted: node.quoted || false,
      };
    }

    // Handle expression nodes (binary operators like AND, OR, etc.)
    if ("left" in node) {
      const result: ParsedExpression = {
        type: "expression",
        left: processNode(node.left),
      };

      // Handle explicit operators (AND, OR, NOT) and the implicit operator
      if (node.operator) {
        result.operator = node.operator;
      } else if (node.right) {
        // If there's a right side but no explicit operator, it's an implicit operator
        result.operator = IMPLICIT;
      }

      if (node.right) {
        result.right = processNode(node.right);
      }

      return result;
    }

    // Fallback
    return { type: "term", value: "", quoted: false };
  }

  /** Then, we convert convert ParsedNode to ProseMirror nodes.
   *  - For explicit fields, we use term nodes.
   *  - For explicit fields with ranges, we use range nodes. (Might consolidate onto term nodes later)
   *  - For explicit operators, we use operator nodes.
   *  - For implicit operators, we use text nodes with the implicitOperator mark.
   *  - For implicit fields, we use text nodes with the implicitTerm marks.
   */
  function parsedNodeToPM(parsedNode: ParsedNode): ProseMirrorNode[] {
    // For text, create a text node with a implicitTerm mark
    if (parsedNode.type === "text") {
      let text = parsedNode.text;
      // Apply quotation marks for display if quoted
      if (parsedNode.quoted) {
        text = `"${text}"`;
      }
      // Apply prefix if present
      if (parsedNode.prefix) {
        text = parsedNode.prefix + text;
      }
      // Apply boost if present
      if (parsedNode.boost) {
        text += `^${parsedNode.boost}`;
      }
      // Create text node with appropriate mark
      let mark: Mark[] = [
        searchSchema.mark("implicitTerm", {
          quoted: parsedNode.quoted,
          regex: parsedNode.regex,
          prefix: parsedNode.prefix,
        }),
      ];
      // If not quoted, not a regex, and contains spaces, split into multiple nodes
      if (!parsedNode.quoted && !parsedNode.regex && text.includes(" ")) {
        const parts = text.split(/( )/);
        const nodes = parts.reduce<ProseMirrorNode[]>((acc, part, idx) => {
          if (part) {
            // preserve the marks on just the first part
            if (idx === 0) {
              acc.push(searchSchema.text(part, mark));
            } else {
              acc.push(searchSchema.text(part));
            }
          }
          return acc;
        }, []);
        return nodes;
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
          result.push(
            searchSchema.text(" ", [searchSchema.mark("implicitOperator")]),
          );
        } else {
          // Explicit operators are nodes
          result.push(
            searchSchema.nodes.operator.create({
              value: parsedNode.operator,
            }),
          );
        }

        result.push(...parsedNodeToPM(parsedNode.right));
        // Check if the right side is just whitespace
        // const isRightOnlyWhitespace =
        //   parsedNode.right.type === "text" &&
        //   /^\s+$/.test(parsedNode.right.text);
        // console.log("Right side is only whitespace:", isRightOnlyWhitespace);
        // // Only include the right side if it's not just whitespace
        // if (!isRightOnlyWhitespace) {
        //   result.push(...parsedNodeToPM(parsedNode.right));
        // }
      }

      return result;
    }

    return [];
  }

  /** Combines all the stepwise functions into a single function that
   *  transforms a query string into a ProseMirror document, catching
   *  any errors that come up during the process.
   */
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
      console.debug("About to parse query…");

      const parsedAST = parse(query);
      console.debug("Parsed AST: ", parsedAST);

      const parsedNode = processNode(parsedAST);
      console.debug("Parsed Node: ", parsedAST);

      const paragraphContent = parsedNodeToPM(parsedNode);
      console.debug("ProseMirror Nodes: ", paragraphContent);

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
        enterErrorRecoveryMode(query, errorMessage);
      }

      // Return plain text in error recovery mode
      return searchSchema.node("doc", {}, [
        searchSchema.node("paragraph", {}, [searchSchema.text(query)]),
      ]);
    }
  }

  /** Convert a ProseMirror document back into a query string
   *  to be reparsed by Lucene. We might benefit from some additional
   *  reverse processing functions to go from:
   *  ProseMirrorNode -> ParsedNode -> Lucene AST -> Lucene Query String
   *  For now, we go immediately from PM Node to Lucene Query String.
   */
  function createQueryFromDoc(doc: ProseMirrorNode): string {
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
  }

  // This plugin is core to the editor's update loop.
  // When the document changes in a way that changes the query,
  // we rebuild the document based on parsing the new query structure.
  const queryTrackingPluginKey = new PluginKey("queryTracking");
  const queryTrackingPlugin = new Plugin({
    key: queryTrackingPluginKey,
    state: {
      init() {
        return { query: initialQuery };
      },
      apply(tr, value) {
        // Skip recomputation if this is a rebuild transaction
        if (tr.getMeta("rebuild")) {
          return value;
        }
        // For a new transaction that changes the doc,
        // figure out if the query has changed
        if (tr.docChanged) {
          const newQuery = createQueryFromDoc(tr.doc);
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
            // Rebuild the document on each query change
            const newDoc = createDocFromQuery(currentQuery);
            // Store the current selection
            const { from, to, head, anchor } = view.state.selection;
            // Replace the current document with this one
            // as a new transaction to avoid recursion
            const tr = view.state.tr.replaceWith(
              0,
              view.state.doc.content.size,
              newDoc.content,
            );
            // Set a meta flag to indicate this is a rebuild
            // and we don't need to rerun the tracking plugin
            tr.setMeta("rebuild", true);
            // Preserve selection if possible
            if (view.state.selection.empty) {
              // If it's just a cursor position, try to maintain it
              const newPos = Math.min(head, newDoc.content.size);
              tr.setSelection(TextSelection.create(tr.doc, newPos));
            } else {
              // If it's a text selection, try to maintain both anchor and head
              const newAnchor = Math.min(anchor, newDoc.content.size);
              const newHead = Math.min(head, newDoc.content.size);
              tr.setSelection(TextSelection.create(tr.doc, newAnchor, newHead));
            }
            // Apply the transaction
            view.dispatch(tr);
            dispatch("queryChange", { query: currentQuery });
          }
        },
      };
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
  function enterErrorRecoveryMode(query: string, message: string) {
    // Guard against re-entry
    if (isErrorRecoveryMode) {
      console.debug("Already in error recovery mode");
      return;
    }
    isErrorRecoveryMode = true;
    errorQuery = query;
    console.warn("Entered error recovery mode with query:", query);
    setParserError(message);
  }

  // Function to exit error recovery mode
  function exitErrorRecoveryMode() {
    if (!isErrorRecoveryMode) return;

    isErrorRecoveryMode = false;

    // Test if current query is valid
    console.debug("Attempting exit from recovery mode.");
    try {
      parse(currentQuery);
    } catch (error) {
      console.debug("Query is still invalid; staying in recovery mode.");
      // Update the error message
      const errorMessage =
        error instanceof Error ? error.message : "Error parsing query";
      setParserError(errorMessage);
      return;
    }

    // Reinitialize the editor with structured nodes
    console.debug("Query is valid; exiting error recovery mode");
    if (view) {
      try {
        // Attempt to reparse the current query
        const currentQuery = createQueryFromDoc(view.state.doc);
        const doc = createDocFromQuery(currentQuery);
        view.dispatch(
          view.state.tr.replaceWith(
            0,
            view.state.doc.content.size,
            doc.content,
          ),
        );
        console.debug("Successfully rebuilt editor after error recovery");
      } catch (e) {
        console.error("Failed to rebuild editor after error recovery:", e);
      }
    }
  }

  // Subscribe to the parser error store to handle transitions between modes
  const unsubscribeParserError = parserError.subscribe(($error) => {
    if ($error.hasError && !isErrorRecoveryMode) {
      enterErrorRecoveryMode(currentQuery, $error.message);
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
        // autocompletePlugin, // WIP, enabling adds buggy behaviors
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
            const currentQuery = createQueryFromDoc(newState.doc);
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
        enterErrorRecoveryMode(query, errorMessage);
      }
    }
  }

  // Public method to get the current query
  export function getQuery(): string {
    return currentQuery;
  }
</script>

<form class="search-editor-container">
  <div
    class="search-editor-status"
    class:error={$parserError.hasError}
    class:warning={queryWarning}
  >
    {#if $parserError.hasError}
      <div class="error-message">
        <Tooltip caption={$parserError.message} placement="bottom-end">
          <Stop16 />
        </Tooltip>
      </div>
    {:else if queryWarning}
      <div class="warning-message">
        <Tooltip caption={queryWarning}>
          <Alert16 />
        </Tooltip>
      </div>
    {:else}
      <Search16 />
    {/if}
  </div>
  <div bind:this={editorRef} class="prosemirror-editor"></div>
  <input type="hidden" name="q" value={currentQuery} />
  <Button
    type="submit"
    mode="primary"
    ghost
    minW={false}
    disabled={!currentQuery || $parserError.hasError}>Search</Button
  >
</form>
{#if view}
  <div class="debug-panel">
    <details open>
      <summary>Debug Information</summary>
      <button on:click={updateDocStructure}> Refresh Doc View </button>
      <section>
        <div class="debug-section">
          <h4>Initial Query</h4>
          <pre>{initialQuery}</pre>
        </div>

        <div class="debug-section">
          <h4>Current Query</h4>
          <pre>{currentQuery}</pre>
        </div>

        <div class="debug-section">
          <h4>Editor Status</h4>
          <pre>{isErrorRecoveryMode
              ? "Error Recovery Mode"
              : queryWarning || "OK"}</pre>
        </div>

        <div class="debug-section">
          <h4>Parsing Error</h4>
          <pre>{JSON.stringify($parserError, null, 2)}</pre>
        </div>

        <div class="debug-section">
          <h4>Lucene AST</h4>
          <pre>
            {#if true}
              {(() => {
                try {
                  const parsed = parse(currentQuery);
                  return JSON.stringify(parsed, null, 2);
                } catch (error) {
                  return `Error: ${error.message}`;
                }
              })()}
            {/if}
          </pre>
        </div>

        <div class="debug-section">
          <h4>ParsedNodes</h4>
          <pre>
            {#if true}
              {(() => {
                try {
                  const parsedQ = processNode(parse(currentQuery));
                  return JSON.stringify(parsedQ, null, 2);
                } catch (error) {
                  return `Error: ${error.message}`;
                }
              })()}
            {/if}
          </pre>
        </div>

        <div class="debug-section">
          <h4>Document Structure</h4>
          <pre>{JSON.stringify($docStructure, null, 2)}</pre>
        </div>

        <!-- <div class="debug-section">
          <h4>Selection</h4>
          <pre>From: {view.state.selection.from}, To: {view.state.selection
              .to}</pre>
        </div> -->
      </section>
    </details>
  </div>
{/if}

<style>
  .search-editor-container {
    width: 100%;
    min-width: 32rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: white;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 0.25rem 0 1rem;
  }

  .search-editor-status {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .prosemirror-editor {
    flex: 1 1 auto;
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

  :global(.search-text[data-prefix="+"]) {
    background-color: var(--green-1);
  }

  :global(.search-text[data-prefix="-"]) {
    background-color: var(--red-1);
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

  .error {
    fill: var(--red-3);
  }
  .warning {
    fill: var(--orange-3);
  }

  /* Debug panel styles */
  .debug-panel {
    width: 100%;
    border-top: 1px dashed #ccc;
    padding: 1rem;
    font-family: var(--font-mono);
    font-size: 12px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 40vh;
    overflow-y: auto;
  }

  .debug-panel section {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: auto;
    gap: 1rem;
  }

  .debug-panel summary {
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .debug-panel button {
    margin: 1rem 0;
    position: absolute;
    top: 0;
    right: 1rem;
  }

  .debug-section {
    margin-bottom: 2rem;
  }

  .debug-section h4 {
    margin: 0 0 4px 0;
    font-size: 13px;
  }

  pre {
    display: block;
    width: 100%;
    max-width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0;
  }
</style>
