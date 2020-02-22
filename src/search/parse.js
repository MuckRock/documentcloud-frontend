import lucene from "lucene";

const validFields = [
  /^id$/,
  /^access$/,
  /^created_at$/,
  /^data_[^ ]+$/,
  /^description$/,
  /^language$/,
  /^organization$/,
  /^page_count$/,
  /^projects?$/,
  /^slug$/,
  /^source$/,
  /^status$/,
  /^title$/,
  /^updated_at$/,
  /^user$/
];

const NORMALIZE_PREFIX = /^[-+]+/g;

export function validField(field) {
  // Normalize away prefixes
  field = field.replace(NORMALIZE_PREFIX, "");
  for (let i = 0; i < validFields.length; i++) {
    if (validFields[i].test(field)) return true;
  }
  return false;
}

export function highlight(query) {
  const parsed = parse(query);
  return parseHighlight(query, parsed);
}

export function parseHighlight(query, parsed) {
  // Get outer bounds of positions from parsed structure
  const getSuperPosition = (...parsedStructures) => {
    let posMin = null;
    let posMax = null;
    const reconcile = (...nums) => {
      for (let i = 0; i < nums.length; i++) {
        const num = nums[i];
        if (num != null) {
          if (posMin == null || num < posMin) posMin = num;
          if (posMax == null || num > posMax) posMax = num;
        }
      }
    };

    for (let i = 0; i < parsedStructures.length; i++) {
      const parsed = parsedStructures[i];
      if (parsed.left != null) {
        reconcile(...getSuperPosition(parsed.left));
      }
      if (parsed.right != null) {
        reconcile(...getSuperPosition(parsed.right));
      }
      if (parsed.fieldLocation != null) {
        reconcile(
          parsed.fieldLocation.start.offset,
          parsed.fieldLocation.end.offset
        );
      }
      if (parsed.termLocation != null) {
        reconcile(
          parsed.termLocation.start.offset,
          parsed.termLocation.end.offset
        );
      }
    }
    return [posMin, posMax];
  };

  const getChunks = parsed => {
    // Grab all field and term locations recursively
    let chunks = [];
    if (
      parsed.fieldLocation != null &&
      parsed.parenthesized &&
      validField(parsed.field)
    ) {
      const position = getSuperPosition(parsed);
      // Extend super position to grab end paren
      const endParenIdx = query.indexOf(")", position[1]);
      if (endParenIdx != -1) {
        position[1] = endParenIdx + 1;
      }
      chunks.push({
        type: "field",
        position
      });
    } else {
      if (parsed.left != null) {
        chunks = chunks.concat(getChunks(parsed.left));
      }
      if (parsed.right != null) {
        chunks = chunks.concat(getChunks(parsed.right));
      }
      if (parsed.fieldLocation != null && parsed.termLocation != null) {
        if (validField(parsed.field)) {
          chunks.push({
            type: "field",
            position: [
              parsed.fieldLocation.start.offset,
              parsed.termLocation.end.offset
            ]
          });
        }
      }
    }
    return chunks;
  };

  // Obtain highlight regions and sort
  const chunks = getChunks(parsed);
  chunks.sort((a, b) => a.position[0] - b.position[0]);

  let pos = 0;
  const highlights = [];

  const advance = offset => {
    const text = query.substr(0, offset);
    query = query.substr(offset);
    pos += offset;
    return text;
  };

  const pushRaw = position => {
    if (position == null) position = query.length;
    if (position == 0) return;
    highlights.push({
      type: "raw",
      text: advance(position)
    });
  };

  const pushHighlight = (type, position) => {
    while (position > 0 && isWhitespace.test(query.charAt(position - 1))) {
      position--;
    }
    if (position == 0) return;

    const text = advance(position);
    const colonIdx = text.indexOf(":");
    let field = null;
    let value = null;
    if (colonIdx != -1) {
      field = text.substr(0, colonIdx + 1);
      value = text.substr(colonIdx + 1);
    }

    highlights.push({
      type,
      field,
      value,
      text
    });
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const start = chunk.position[0] - pos;
    pushRaw(start);
    pushHighlight(chunk.type, chunk.position[1] - chunk.position[0]);
  }
  pushRaw();

  return highlights;
}

export function parse(query) {
  try {
    return lucene.parse(query);
  } catch (e) {
    // If query parsing fails, escape the query and try again
    // Just like how Solr does it for edismax
    const clauses = splitIntoClauses(query, false);
    const { escaped, mapping } = escapeUserQuery(clauses);
    const parsed = lucene.parse(escaped);
    // Restore positions using mapping
    transform(parsed, mapping);
    return parsed;
  }
}

function transform(parsed, mapping) {
  const transformOffset = offset => {
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

  const transformLocation = location => {
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

export function splitIntoClauses(s, ignoreQuote) {
  const lst = [];
  let clause;
  let pos = 0;
  let end = s.length;
  let ch = null;
  let start;
  let disallowUserField;

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
    if (clause.field != null && !isAllowed(clause.field)) {
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

    let inString = null;
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
        if (inString == null) {
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
          clause = null;
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

function escapeUserQuery(clauses) {
  let sb = "";
  const mapping = [];
  for (let i = 0; i < clauses.length; i++) {
    const start = sb.length;
    const clause = clauses[i];
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
    if (clause.field != clause.rawField && clause.field != null) {
      // Accommodate shifts due to preceding characters
      shift = clause.field.length - clause.rawField.length;
    }
    // Skip adding user field boost
    const end = sb.length;
    mapping.push([clause.pos, [start + shift, end + shift]]);
    sb += " ";
  }
  return { escaped: sb, mapping };
}
