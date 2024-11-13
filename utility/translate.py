# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "click",
#     "ollama",
#     "tqdm",
# ]
# ///
import json
import sys

import click
import ollama
from tqdm import tqdm

from typing import Generator

SYSTEM = """You are translating text on a website. 
Translate each string to the given language, returning only the translated text, nothing else. Don't wrap the output in quotes.
Output unicode text with diacritics or accent marks as needed. No explanation. No yapping.

There may be HTML in some strings. Leave that as-is.

Some strings contain template parts in curly braces, like this: "Signed in as {name}." Leave any text
in braces as-is. Some examples: 

- In Italian, "Signed in as {name}" should be translated to, "Segnato come {name}".
- Translate "Showing {n, number} of {total, number} results" like this: "Mostrando {n, number} di {total, number} risultati".
- Translate "{n} active {n, plural, one {process} other {processes}}" to "{n} {n, plural, one {progetto attivo} other {progetti attivi}}"

If the string is too short to translate or looks like a programmatic expression, return the original string.
For example, date formatting strings like "MM" can be left alone.
"""

PROMPT = 'Translate the following text into {language}: "{text}"'
MODEL = "llama3.2"


@click.group()
def cli():
    pass


@cli.command()
@click.argument("text")
@click.option("--language", nargs=1, required=True)
def translate(text: str, language: str):
    click.echo(translate_text(text, language))


@cli.command("json")
@click.argument("source", type=click.File("r"))
@click.option("-d", "--dest", type=click.File("w"), default=sys.stdout)
@click.option("-l", "--language", required=True)
@click.option("--debug", is_flag=True)
def translate_json(source, dest, language, debug=False):
    data = json.load(source)
    out = {}
    for key, value in tqdm(walk(data)):
        t = translate_text(value, language)
        if debug:
            click.echo(f"{key}: {value}\n{t}", err=True)

        nested_set(out, key.split("."), t)

    json.dump(out, dest, indent=2)


@cli.command("python")
def py():
    "Find the path to the Python we're using in this script, for VS Code"
    click.echo(sys.executable)


def translate_text(text: str, language: str) -> str:
    prompt = PROMPT.format(language=language, text=text)
    response = ollama.chat(
        MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
    )

    return response["message"]["content"]


def walk(
    obj: dict | str, current_path: str = ""
) -> Generator[tuple[str, str], None, None]:
    # leaf node
    if isinstance(obj, str):
        yield (current_path, obj)

    elif isinstance(obj, dict):
        for key, value in obj.items():
            path = f"{current_path}.{key}" if current_path else key
            yield from walk(value, path)


def nested_set(d: dict, keys: list[str], value: any):
    for key in keys[:-1]:
        d = d.setdefault(key, {})
    d[keys[-1]] = value


if __name__ == "__main__":
    cli.main()
