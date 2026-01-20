---
name: translate-changes
description: Detects changes to en.json in current branch and translates modified strings to other language files (de, es, fr, it, ru, uk). Only translates modifications, not missing keys.
allowed-tools: Read, Edit, Bash, Glob, Grep
---

# Translation Updates Skill

Automatically translates changes made to `src/langs/json/en.json` in the current branch to all other language files.

## Important: Only Modified Keys

This skill ONLY translates keys that have been **modified or added in the current branch**. It does NOT translate pre-existing keys that are missing translations.

## How it works

1. **Detect changes**: Uses `git diff` to find modified keys in en.json (both uncommitted and committed changes)
2. **Extract modified keys**: Parses the diff to identify new or changed English strings
3. **Translate**: Generates appropriate translations for each supported language
4. **Update files**: Applies translations to language-specific JSON files

## Supported Languages

- German (de.json)
- Spanish (es.json)
- French (fr.json)
- Italian (it.json)
- Russian (ru.json)
- Ukrainian (uk.json)

All files are located in `src/langs/json/`

## Usage

After modifying strings in `en.json`, simply ask:

```
translate the changes to en.json
```

Or invoke the skill directly:

```
/translate-changes
```

## Workflow

### Step 1: Detect modifications

The skill detects changes from two sources:

```bash
# Uncommitted changes (working directory + staged)
git diff HEAD -- src/langs/json/en.json

# Committed changes in current branch
git diff main...HEAD -- src/langs/json/en.json
```

This captures both uncommitted modifications and changes committed in the current branch compared to main.

### Step 2: Parse changes

Look for lines starting with `+` in the diff that contain JSON keys:

- Lines like `+    "keyName": "Value"` indicate additions or modifications
- Ignore lines that are just structural changes (commas, brackets)

### Step 3: Extract key paths

For each modified line, determine:

- The full JSON path (e.g., `addonDispatchDialog.signedOut`)
- The new English value

### Step 4: Translate

For each modified key:

1. Generate translations for all 6 languages
2. Maintain the same HTML structure (e.g., `<a href="{href}">text</a>`)
3. Preserve placeholders like `{href}`, `{n}`, etc.
4. Match the tone and formality of existing translations in that language

### Step 5: Update files

For each language file:

1. Read the current content
2. Locate the key to update using the JSON path
3. Use Edit tool to update the specific key
4. Preserve JSON formatting and structure

## Translation Guidelines

- **Maintain HTML**: If English has HTML tags, keep them in translations
- **Preserve placeholders**: Variables like `{href}`, `{n}`, etc. must stay unchanged
- **Match formality**: Use the same level of formality as existing translations
- **ICU format**: Respect plural rules (e.g., `{n, plural, one {...} other {...}}`)
- **Context aware**: Consider the key path for context (e.g., button vs paragraph text)

## Example Translations

English:

```json
"signedOut": "You must <a href=\"{href}\">sign in</a> before dispatching this add-on."
```

Translations should maintain:

- The `<a href="{href}">` structure
- The `{href}` placeholder
- Appropriate word order for each language

## Output Format

After translating, show:

1. Summary of changes detected
2. List of keys modified
3. Confirmation of files updated
4. Verification command to check results

## Verification

After updates, verify with:

```bash
for file in src/langs/json/{de,es,fr,it,ru,uk}.json; do
  echo "=== $file ==="
  jq -r '.path.to.modified.key // "MISSING"' "$file"
done
```

## Notes

- JSON files use Unicode escape sequences (e.g., `\u00e9` for é)
- The Edit tool will preserve this encoding automatically
- Always use Edit tool, not Bash sed/awk, to maintain JSON validity
- Files should remain valid JSON after updates
