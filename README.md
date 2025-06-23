# Taiga contrib notes

The Taiga plugin for note integration.

### Taiga Back

Load the python virtualenv from your Taiga back directory:

```bash
source .venv/bin/activate
```

And install the package `taiga-contrib-note` with:

```bash
  (taiga-back) pip install "git+https://github.com/hungResearch/taiga-contrib-notes.git@main#egg=taiga-contrib-notes&subdirectory=backend"
```

Modify in `taiga-back` your `settings/config.py` and include the line:

```python
  INSTALLED_APPS += ["taiga_contrib_notes"]
```

Then run the migrations to generate the required new table:

```bash
  python manage.py migrate taiga_contrib_notes
```

#### Taiga Front

Download in your `dist/plugins/` directory of Taiga front the `taiga-contrib-notes` compiled code (you need subversion in your system):

```bash
  cd dist/
  mkdir -p plugins
  cd plugins
  svn export "https://github.com/hungResearch/taiga-contrib-notes/trunk/frontend" "notes"
```

Include in your `dist/conf.json` in the `contribPlugins` list the value `"plugins/notes/notes.json"`:

```json
...
    "contribPlugins": [
        (...)
        "plugins/notes/notes.json"
    ]
...
```