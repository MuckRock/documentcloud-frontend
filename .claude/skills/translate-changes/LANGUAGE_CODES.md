# Language File Reference

## Supported Languages

| Language         | File    | Code | Notes                                |
| ---------------- | ------- | ---- | ------------------------------------ |
| English (source) | en.json | en   | Source of truth for all translations |
| German           | de.json | de   | Formal "Sie" form                    |
| Spanish          | es.json | es   | Latin American Spanish               |
| French           | fr.json | fr   | Standard French                      |
| Italian          | it.json | it   | Standard Italian                     |
| Russian          | ru.json | ru   | Includes ICU plural rules            |
| Ukrainian        | uk.json | uk   | Includes ICU plural rules            |

## File Locations

All files are located in: `/src/langs/json/`

## JSON Structure

Each language file maintains the same nested key structure as `en.json`:

```json
{
  "dialog": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "addonDispatchDialog": {
    "signedOut": "You must <a href=\"{href}\">sign in</a>..."
  }
}
```

## Special Formatting

### HTML Tags

Many strings contain HTML for links or formatting:

```json
"signedOut": "You must <a href=\"{href}\">sign in</a> before..."
```

Translations MUST preserve the HTML structure exactly.

### Variable Placeholders

Strings may contain variables in curly braces:

- `{href}` - URLs
- `{n}` - Numbers
- `{name}` - Names or identifiers

These MUST remain unchanged in translations.

### ICU MessageFormat

Some strings use ICU MessageFormat for pluralization:

```json
"labelSelected": "{n, plural, one {# document} other {# documents}}"
```

Russian and Ukrainian have complex plural rules:

```json
"labelSelected": "{n, plural, one {# документ} few {# документа} many {# документов} other {# документов}}"
```

## Translation Style Guidelines

### German (de.json)

- Use formal "Sie" form
- Compound nouns are common
- Example: "anmelden" (sign in), "ausführen" (execute)

### Spanish (es.json)

- Latin American Spanish preferred
- Use "usted" form (formal)
- Example: "iniciar sesión" (sign in), "ejecutar" (execute)

### French (fr.json)

- Use "vous" form (formal)
- Elision rules apply (l' before vowels)
- Example: "se connecter" (sign in), "exécuter" (execute)

### Italian (it.json)

- Use "Lei" form (formal in some contexts) or informal based on existing patterns
- Example: "accedere" (sign in), "eseguire" (execute)

### Russian (ru.json)

- Cyrillic alphabet
- Complex case and gender agreement
- Example: "войти" (sign in), "запустить" (execute)

### Ukrainian (uk.json)

- Cyrillic alphabet (different from Russian)
- Similar grammar to Russian but distinct vocabulary
- Example: "увійти" (sign in), "запустити" (execute)

## Encoding

All JSON files use Unicode escape sequences for non-ASCII characters:

- `é` becomes `\u00e9`
- `ñ` becomes `\u00f1`
- Cyrillic characters are also escaped

The Edit tool handles this automatically - no manual encoding needed.

## Verification Commands

### Check a specific key across all languages

```bash
for file in src/langs/json/{de,es,fr,it,ru,uk}.json; do
  echo "=== $file ==="
  jq -r '.addonDispatchDialog.signedOut // "MISSING"' "$file"
done
```

### Validate JSON syntax

```bash
for file in src/langs/json/*.json; do
  echo "Validating $file..."
  jq empty "$file" && echo "✓ Valid"
done
```

### Compare keys between en.json and another language

```bash
diff \
  <(jq -r 'keys | .[]' src/langs/json/en.json) \
  <(jq -r 'keys | .[]' src/langs/json/de.json)
```

## Common Issues

### Missing keys

- Only translate MODIFIED keys, not missing ones
- Many existing keys are intentionally untranslated

### Formatting

- JSON must remain valid after edits
- Maintain consistent indentation (2 spaces)
- Commas must be correct (no trailing comma on last item)

### Context

- Consider the full key path for context
- Dialog buttons differ from page headers
- Form labels differ from help text
