import type { Nullable } from "@/lib/api/types";
import lucene from "lucene";

const validFields = [
  /^id$/,
  /^document$/, // maps to id
  /^access$/,
  /^created_at$/,
  /^data_[a-zA-Z0-9_-]+$/,
  /^tag$/, // maps to data__tag
  /^description$/,
  /^language$/,
  /^organization$/,
  /^group$/, // maps to organization
  /^page_count$/,
  /^pages$/, // maps to page count
  /^projects?$/,
  /^project?$/, // maps to projects
  /^slug$/,
  /^source$/,
  /^status$/,
  /^title$/,
  /^updated_at$/,
  /^user$/,
  /^account$/, // maps to user
  /^doctext$/,
  /^text$/, // maps to doctext
  /^page_no_[0-9]+$/,
  /^sort$/,
  /^order$/, // maps to order
];

interface Clause {
  must?: Nullable<string>;
  field?: Nullable<string>;
  rawField?: string;
  isPhrase?: boolean;
  hasWhitespace?: boolean;
  hasSpecialSyntax?: boolean;
  val?: string;
  syntaxError?: boolean;
  pos?: [number, number];
  raw?: string;
}

type Pair = [Nullable<number>, Nullable<number>];

const OPERATORS: lucene.Operator[] = ["AND", "OR", "NOT"];
const OPERATORS_RE = new RegExp(
  `${OPERATORS.map((x) => `(${x})`).join("|")}|(.+?)`,
);
const NORMALIZE_PREFIX = /^[-+]+/g;

export function validField(field: string): boolean {
  // Normalize away prefixes
  field = field.replace(NORMALIZE_PREFIX, "");
  for (let i = 0; i < validFields.length; i++) {
    if (validFields[i]?.test(field)) return true;
  }
  return false;
}

export function highlight(query: string) {
  const parsed = parse(query);
  return parseHighlight(query, parsed);
}

function isAST(ast: unknown): ast is lucene.AST {
  if (typeof ast === "object" && ast != null) {
    return Object.hasOwn(ast, "left");
  }
  return false;
}

function isBinaryAST(ast: unknown): ast is lucene.BinaryAST {
  if (typeof ast === "object" && ast != null) {
    return Object.hasOwn(ast, "right");
  }
  return false;
}

function isNodeTerm(n: unknown): n is lucene.NodeTerm {
  if (typeof n === "object" && n != null) {
    return Object.hasOwn(n, "term");
  }
  return false;
}

function isNodeRangedTerm(n: unknown): n is lucene.NodeRangedTerm {
  if (typeof n === "object" && n != null) {
    return Object.hasOwn(n, "term_max");
  }
  return false;
}

export function parseHighlight(query: string, parsed: lucene.AST) {
  // Get outer bounds of positions from parsed structure
  const getSuperPosition = (
    ...parsedStructures: Array<lucene.AST | lucene.Node>
  ): [Nullable<number>, Nullable<number>] => {
    let posMin: Nullable<number> = null;
    let posMax: Nullable<number> = null;

    const reconcile = (...nums: Nullable<number>[]) => {
      for (let i = 0; i < nums.length; i++) {
        const num = nums[i];
        if (num != null) {
          if (posMin == null || num < posMin) posMin = num;
          if (posMax == null || num > posMax) posMax = num;
        }
      }
    };

    parsedStructures.forEach((parsed) => {
      if (isAST(parsed) && parsed.left != null) {
        reconcile(...getSuperPosition(parsed.left));
      }
      if (isBinaryAST(parsed) && parsed.right != null) {
        reconcile(...getSuperPosition(parsed.right));
      }
      if (parsed.fieldLocation != null) {
        reconcile(
          parsed.fieldLocation.start.offset,
          parsed.fieldLocation.end.offset,
        );
      }
      if (isNodeTerm(parsed) && parsed.termLocation != null) {
        reconcile(
          parsed.termLocation.start.offset,
          parsed.termLocation.end.offset,
        );
      }
    });
    return [posMin, posMax];
  };

  interface Chunk {
    type: string;
    position: Pair;
  }

  const getChunks = (parsed: lucene.AST | lucene.Node) => {
    // Grab all field and term locations recursively
    let chunks: Chunk[] = [];
    if (
      isAST(parsed) &&
      parsed.fieldLocation != null &&
      parsed.parenthesized &&
      parsed.field &&
      validField(parsed.field)
    ) {
      const position = getSuperPosition(parsed);
      // Extend super position to grab end paren
      const endParenIdx = query.indexOf(")", position[1] ?? undefined);
      if (endParenIdx != -1) {
        position[1] = endParenIdx + 1;
      }
      chunks.push({
        type: "field",
        position,
      });
    } else if (
      isNodeRangedTerm(parsed) &&
      parsed.fieldLocation != null &&
      parsed.inclusive &&
      parsed.field &&
      validField(parsed.field)
    ) {
      const position = getSuperPosition(parsed);
      // Extend super position to grab end bracket or brace
      const endParenIndex = query.indexOf("]", position[1] ?? undefined);
      const endBraceIndex = query.indexOf("}", position[1] ?? undefined);
      const endIndex = Math.min(
        endParenIndex == -1 ? Infinity : endParenIndex,
        endBraceIndex == -1 ? Infinity : endBraceIndex,
      );
      if (endIndex != Infinity) {
        position[1] = endIndex + 1;
      }
      chunks.push({
        type: "field",
        position,
      });
    } else {
      if (isAST(parsed) && parsed.left != null) {
        chunks = chunks.concat(getChunks(parsed.left));
      }
      if (isBinaryAST(parsed) && parsed.right != null) {
        chunks = chunks.concat(getChunks(parsed.right));
      }
      if (
        isNodeTerm(parsed) &&
        parsed.fieldLocation != null &&
        parsed.termLocation != null
      ) {
        if (validField(parsed.field)) {
          chunks.push({
            type: "field",
            position: [
              parsed.fieldLocation.start.offset,
              parsed.termLocation.end.offset,
            ],
          });
        }
      } else if (isNodeTerm(parsed) && parsed.quoted) {
        const position: Pair = [
          parsed.termLocation.start.offset,
          parsed.termLocation.end.offset,
        ];
        const text = query.substring(
          parsed.termLocation.start.offset,
          parsed.termLocation.end.offset,
        );
        if (text.startsWith('"') || text.endsWith('"')) {
          chunks.push({
            type: "quote",
            position,
          });
        }
      }
    }
    return chunks;
  };

  // Obtain highlight regions and sort
  const chunks = getChunks(parsed);
  chunks.sort((a, b) => {
    let aPos = a.position[0];
    let bPos = b.position[0];
    if (aPos && bPos) {
      return aPos - bPos;
    }
    return 0;
  });

  interface Highlight {
    type: string;
    text?: string;
    field?: Nullable<string>;
    value?: Nullable<string>;
  }

  let pos = 0;
  const highlights: Array<Highlight> = [];

  const advance = (offset) => {
    const text = query.substr(0, offset);
    query = query.substr(offset);
    pos += offset;
    return text;
  };

  const pushRaw = (position) => {
    if (position == null) position = query.length;
    if (position == 0) return;

    // Match operators
    const text = advance(position);
    const textGroups = text
      .split(OPERATORS_RE)
      .filter((x) => x != null && x.length >= 1);

    let rawBuffer = "";
    const clearBuffer = () => {
      if (rawBuffer.length > 0) {
        highlights.push({ type: "raw", text: rawBuffer });
      }
      rawBuffer = "";
    };
    for (let i = 0; i < textGroups.length; i++) {
      const group = textGroups[i];
      if (group && OPERATORS.includes(group as lucene.Operator)) {
        clearBuffer();
        highlights.push({ type: "operator", text: group });
      } else {
        rawBuffer += group;
      }
    }
    clearBuffer();
  };

  const pushHighlight = (type, position) => {
    while (position > 0 && isWhitespace.test(query.charAt(position - 1))) {
      position--;
    }
    if (position == 0) return;

    const text = advance(position);
    const colonIdx = text.indexOf(":");
    let field: Nullable<string> = null;
    let value: Nullable<string> = null;
    if (colonIdx != -1) {
      field = text.substr(0, colonIdx + 1);
      value = text.substr(colonIdx + 1);
    }

    highlights.push({
      type,
      field,
      value,
      text,
    });
  };

  chunks.forEach((chunk) => {
    const start = (chunk.position[0] ?? 0) - pos;
    pushRaw(start);
    pushHighlight(
      chunk.type,
      (chunk.position[1] ?? 0) - (chunk.position[0] ?? 0),
    );
  });
  pushRaw(null);

  return highlights;
}

export function parse(query: string): lucene.AST {
  try {
    return lucene.parse(query);
  } catch (e) {
    // If query parsing fails, escape the query and try again
    // Just like how Solr does it for edismax
    const { escaped, mapping } = splitAndEscape(query);
    const parsed = lucene.parse(escaped);
    // Restore positions using mapping
    transform(parsed, mapping);
    return parsed;
  }
}

export function splitAndEscape(query: string) {
  const clauses = splitIntoClauses(query, false);
  return escapeUserQuery(clauses);
}

function transform(parsed, mapping) {
  const transformOffset = (offset) => {
    for (let i = 0; i < mapping.length; i++) {
      const originalStart = mapping[i][0][0];
      const transformedStart = mapping[i][1][0];
      const transformedEnd = mapping[i][1][1];
      if (
        (offset >= transformedStart && offset < transformedEnd) ||
        i == mapping.length - 1
      ) {
        return offset + originalStart - transformedStart;
      }
    }
    return offset;
  };

  const transformLocation = (location) => {
    location.start.offset = transformOffset(location.start.offset);
    location.end.offset = transformOffset(location.end.offset) - 1;
  };

  // Use mapping table to restore positions
  if (parsed.left != null) {
    transform(parsed.left, mapping);
  }
  if (parsed.right != null) {
    transform(parsed.right, mapping);
  }
  if (parsed.fieldLocation != null) {
    transformLocation(parsed.fieldLocation);
  }
  if (parsed.termLocation != null) {
    transformLocation(parsed.termLocation);
  }
}

// Methods ported from Java: https://github.com/apache/lucene-solr/blob/master/solr/core/src/java/org/apache/solr/search/ExtendedDismaxQParser.java

const isWhitespace = /\s/;
const isJavaIdentifierPart = /[a-zA-Z0-9$_]/;
const isAllowed = () => true; // if user field is allowed

export function splitIntoClauses(
  s: string,
  ignoreQuote: boolean,
): Array<Clause> {
  const lst: Array<Clause> = [];
  let clause: Clause;
  let pos = 0;
  let end = s.length;
  let ch: Nullable<string> = null;
  let start: number;
  let disallowUserField: boolean;

  while (pos < end) {
    clause = {};
    disallowUserField = true;
    ch = s.charAt(pos);

    while (isWhitespace.test(ch)) {
      if (++pos >= end) break;
      ch = s.charAt(pos);
    }

    start = pos;

    if ((ch == "+" || ch == "-") && pos + 1 < end) {
      clause.must = ch;
      pos++;
    }

    clause.field = getFieldName(s, pos, end);
    if (clause.field != null && !isAllowed()) {
      clause.field = null;
    }
    if (clause.field != null) {
      disallowUserField = false;
      const colon = s.indexOf(":", pos);
      clause.rawField = s.substring(pos, colon);
      pos += colon - pos; // skip the field
      pos++; // skip the ':'
    }

    if (pos >= end) break;

    let inString: Nullable<string> = null;
    ch = s.charAt(pos);
    if (!ignoreQuote && ch == '"') {
      clause.isPhrase = true;
      inString = '"';
      pos++;
    }

    let sb = "";
    while (pos < end) {
      ch = s.charAt(pos++);
      if (ch == "\\") {
        // skip escaped character
        sb += ch;
        if (pos >= end) {
          sb += ch; // double backslash
          break;
        }
        ch = s.charAt(pos++);
        sb += ch;
        continue;
      } else if (inString != null && ch == inString) {
        inString = null;
        break;
      } else if (isWhitespace.test(ch)) {
        clause.hasWhitespace = true;
        if (!inString) {
          // end of the token if we aren't in a string, backing
          // up the position.
          pos--;
          break;
        }
      }

      if (inString == null) {
        switch (ch) {
          case "!":
          case "(":
          case ")":
          case ":":
          case "^":
          case "[":
          case "]":
          case "{":
          case "}":
          case "~":
          case "*":
          case "?":
          case '"':
          case "+":
          case "-":
          case "\\":
          case "|":
          case "&":
          case "/":
            clause.hasSpecialSyntax = true;
            sb += "\\";
        }
      } else if (ch == '"') {
        // only char we need to escape in a string is double quote
        sb += "\\";
      }
      sb += ch;
    }
    clause.val = sb;

    if (clause.isPhrase) {
      if (inString != null) {
        // detected bad quote balancing... retry
        // parsing with quotes like any other char
        return splitIntoClauses(s, true);
      }

      // special syntax in a string isn't special
      clause.hasSpecialSyntax = false;
    } else {
      // an empty clause... must be just a + or - on its own
      if (clause.val.length == 0) {
        clause.syntaxError = true;
        if (clause.must != null) {
          clause.val = "\\" + clause.must;
          clause.must = null;
          clause.hasSpecialSyntax = true;
        } else {
          // uh.. this shouldn't happen.
          throw new Error("Unexpected clause");
        }
      }
    }

    if (clause != null) {
      if (disallowUserField) {
        clause.raw = s.substring(start, pos);
        // escape colons, except for "match all" query
        if ("*:*" != clause.raw) {
          clause.raw = clause.raw.replace(/([^\\]):/g, "$1\\:");
        }
      } else {
        clause.raw = s.substring(start, pos);
        // ignore adding boost
      }
      clause.pos = [start, pos];
      lst.push(clause);
    }
  }

  return lst;
}

function getFieldName(s, pos, end) {
  if (pos >= end) return null;
  let p = pos;
  const colon = s.indexOf(":", pos);
  // make sure there is space after the colon, but not whitespace
  if (
    colon <= pos ||
    colon + 1 >= end ||
    isWhitespace.test(s.charAt(colon + 1))
  )
    return null;
  let ch = s.charAt(p++);
  while ((ch == "(" || ch == "+" || ch == "-") && pos < end) {
    ch = s.charAt(p++);
    pos++;
  }
  if (!isJavaIdentifierPart.test(ch)) return null;
  while (p < colon) {
    ch = s.charAt(p++);
    if (!(isJavaIdentifierPart.test(ch) || ch == "-" || ch == ".")) return null;
  }
  const fname = s.substring(pos, p);
  const isInSchema = true; // TODO: have schema and check if in it
  const isAlias = false;
  const isMagic = false;
  return isInSchema || isAlias || isMagic ? fname : null;
}

function escapeUserQuery(clauses: Clause[]) {
  let sb = "";
  const mapping: [Pair, Pair][] = [];
  clauses.forEach((clause) => {
    const start = sb.length;
    let doQuote = clause.isPhrase;

    const s = clause.val;
    if (!clause.isPhrase && (s == "OR" || s == "AND" || s == "NOT")) {
      doQuote = true;
    }

    if (clause.must != null) {
      sb += clause.must;
    }
    if (clause.field != null) {
      sb += clause.field;
      sb += ":";
    }
    if (doQuote) {
      sb += '"';
    }
    sb += clause.val;
    if (doQuote) {
      sb += '"';
    }
    let shift = 0;
    if (clause.field != clause.rawField && clause.field) {
      // Accommodate shifts due to preceding characters
      shift = clause.field.length - (clause.rawField?.length ?? 0);
    }
    // Skip adding user field boost
    const end = sb.length;
    mapping.push([clause.pos ?? [null, null], [start + shift, end + shift]]);
    sb += " ";
  });
  return { escaped: sb, mapping };
}
