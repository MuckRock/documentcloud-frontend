import { Plugin } from "prosemirror-state";
import { Slice } from "prosemirror-model";
import { serialize } from "./pm-serialize";
import { deserialize } from "./pm-deserialize";

/**
 * Clipboard plugin for the search editor.
 *
 * Copy: Serializes the selected PM fragment to a Lucene query string
 * and writes it to the clipboard as plain text. This ensures that
 * copying chips produces valid Lucene syntax.
 *
 * Paste: Deserializes pasted text through the Lucene parser, producing
 * structured PM nodes (chips) where appropriate. Operators like AND/OR/NOT
 * in pasted text get decorations, which is intentional — they reflect
 * how Solr will actually interpret the text.
 */
export function clipboardPlugin(): Plugin {
  return new Plugin({
    props: {
      /**
       * On copy/cut, serialize the selected fragment to Lucene text
       * and write to clipboard.
       */
      handleDOMEvents: {
        copy(view, event) {
          const { state } = view;
          if (state.selection.empty) return false;

          const slice = state.selection.content();
          const text = serialize(slice.content);

          if (event.clipboardData) {
            event.clipboardData.setData("text/plain", text);
            event.preventDefault();
            return true;
          }
          return false;
        },
        cut(view, event) {
          const { state } = view;
          if (state.selection.empty) return false;

          const slice = state.selection.content();
          const text = serialize(slice.content);

          if (event.clipboardData) {
            event.clipboardData.setData("text/plain", text);
            event.preventDefault();

            // Delete the selected content
            const tr = state.tr.deleteSelection();
            view.dispatch(tr);
            return true;
          }
          return false;
        },
      },

      /**
       * Parse pasted text as a Lucene query, producing structured PM nodes.
       * Returns a Slice containing the deserialized content.
       */
      clipboardTextParser(text) {
        const doc = deserialize(text);
        // Extract the inline content from inside the doc > paragraph wrapper.
        // doc structure is: doc > paragraph > [inline nodes]
        // We want a Slice of just the inline nodes.
        return doc.slice(1, doc.content.size - 1);
      },
    },
  });
}
