import { allIndices } from "./string";

export function coalesceHighlights(text, highlights) {
  // Highlight text based on Solr search highlights.
  if (text == null) text = "";
  if (highlights == null) return [{ type: "normal", text }];

  // Get concatenated text for each highlighted passage.
  const highlightTexts = highlights.map((x) =>
    x.reduce((a, b) => a + b.text, ""),
  );
  // Get ranges of where highlighted regions begin within highlighted passages.
  const relativeRanges = highlights.map((passages) => {
    const ranges = [];
    let pos = 0;
    for (let i = 0; i < passages.length; i++) {
      const passage = passages[i];
      if (passage.type == "highlight") {
        ranges.push([pos, pos + passage.text.length]);
      }
      pos += passage.text.length;
    }
    return ranges;
  });
  // Get indices at which concatenated highlighted regions occur in the text.
  const indices = highlightTexts.map((query) => allIndices(text, query));
  const absoluteRanges = [];

  indices.forEach((subIndices, i) =>
    subIndices.forEach((idx) =>
      relativeRanges[i].forEach(([start, end]) =>
        absoluteRanges.push([idx + start, idx + end]),
      ),
    ),
  );
  absoluteRanges.sort((a, b) => a[0] - b[0]);

  const results = [];
  const push = (start, end, type = "normal") => {
    if (start == end) return;
    const contents = text.substring(start, end);

    // Check for merge
    let merged = contents;
    let i;
    for (i = results.length - 1; i >= 0; i--) {
      const result = results[i];
      if (result.type == type) {
        merged = result.text + merged;
      } else if (result.text.trim().length == 0) {
        merged = result.text + merged;
      } else {
        break;
      }
    }
    i++;

    // Merge if successful
    if (i < results.length) {
      results[i].text = merged;
      results.length = i + 1;
    } else {
      // Push normal block
      results.push({ type, text: contents });
    }
  };

  let pos = 0;
  for (let i = 0; i < absoluteRanges.length; i++) {
    const [start, end] = absoluteRanges[i];

    push(pos, start);
    push(start, end, "highlight");
    pos = end;
  }
  push(pos, text.length);
  return results;
}

export function coalesceSelectableHighlights(words, highlights) {
  // Get highlights in block form
  const highlightBlocks = highlights.map((highlight) =>
    highlight.map((block) => ({
      ...block,
      text: block.text.split(/\s/).filter((x) => x.length > 0),
    })),
  );

  // Go through each word, seeing if the current highlight aligns
  const results = [];
  let blockIndex = 0;
  for (let i = 0; i < words.length; i++) {
    let matched = false;
    const newHighlights = [];
    let seekI = i;
    // Only try to match highlights if we haven't consumed them already
    if (blockIndex < highlightBlocks.length) {
      // Get desired highlight
      matched = true;
      const highlight = highlightBlocks[blockIndex];

      // See if it maps word-for-word with current text position
      for (let j = 0; j < highlight.length; j++) {
        // Go through each collection of text blocks
        const block = highlight[j].text;
        for (let k = 0; k < block.length; k++) {
          // Go through each text object
          const text = block[k];
          if (text.toLowerCase() != words[seekI].text.toLowerCase()) {
            // Not a match: abort
            matched = false;
            break;
          }
          newHighlights.push(highlight[j].type);
          seekI++;
        }
        // Abort early if not matched
        if (!matched) break;
      }
    }

    if (matched) {
      // Handle match
      blockIndex++;
      for (let j = i; j < seekI; j++) {
        results.push({ ...words[j], type: newHighlights[j - i] });
      }
    } else {
      // No match, push normal word
      results.push({ ...words[i], type: "normal" });
    }
  }
  return results;
}
