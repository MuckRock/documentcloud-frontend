# Utility scripts

## Python scripts

The `translate.py` script depends on the `uv` package to download dependencies (including the correct version of Python). It also needs a copy of Ollama running locally, using the `llama3.2` model.

Run like this:

```sh
ollama pull llama3.2
ollama serve # if not already sarted
uv run utilities/translate.py json src/langs/json/en.json -d src/langs/json/it.json -l Italian
```

# Shell scripts

Shell scripts are meant to run from the project root. Running from the `utility` folder will produce incorrect paths.
