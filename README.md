# DocumentCloud frontend

The main frontend for DocumentCloud, written in [Svelte](https://svelte.dev/).

## Usage

This project is a standard Node project but wrapped to run in Docker compose. In order to use this project, [Squarelet](https://github.com/muckrock/squarelet) and [DocumentCloud (Django)](https://github.com/muckrock/documentcloud) must already be running.

In order to install, run:

```bash
make install
```

Once the node modules have been installed, start the app with:

```bash
make dev
```

If your hosts are set up properly, you should be able to see the website live at [www.dev.documentcloud.org](http://www.dev.documentcloud.org/).

## Building for production

Run `make build` to build the production version of the app. The project will be output in the `public` directory. Webpack will also run a bundle analyzer on port 80, exposing the size of various components of your application. You can browse it at the same dev URL: [www.dev.documentcloud.org](http://www.dev.documentcloud.org/)

## Project structure

Notable files/folders in the project:

```bash
documentcloud-svelte
│
| # Files which remain uncompiled
└───public
|   |
|   |   # The main index file. Modify to include fonts, stylesheets, favicons, etc.
|   │   index.html
|   |
|   |   # Global styles here
|   │   global.css
|   |
|   |   # The favicon
|   |   favicon.png
|   |
|   |   # A Netlify redirects file to make single-page applications redirect to index.html for everything
|   |   _redirects
|   |
|   |   ...  # Anything else is a compiled output
|
| # Svelte source code that gets compiled by Webpack
└───src
|   |
|   | # API interfaces, authentication and session management
|   └───api
|   |
|   | # Assets, notably SVG files, that are inlined into the web app bundle
|   └───assets
|   |
|   | # Global Sass styling
|   └───style
|   |   │
|   |   |   # The primary variables file for sharing colors, sizes, etc
|   |   |   variables.scss
|   |
|   | # Shared Svelte components that offer general functionality
|   └───common
|   |
|   | # Svelte page components
|   └───pages
|   |
|   | # Global stores and functions to represent the document manager state
|   └───manager
|   |
|   | # Global stores and functions to represent the viewer state
|   └───viewer
|   |
|   | # Supporting code for search functionality
|   └───search
|   |
|   | # Classes to represent data like documents and projects
|   └───structure
|   |
|   | # Common utility functions to handle simple, general purpose tasks
|   └───util
|   |
|   | # Code to support the main event loop
|   └───ticker
|   |
|   | # Legacy embed loader scripts
|   └───embed
|   |
|   | # Router code and components
|   └───router
|   |
|   |   # The main route table
|   │   routes.js
|   |
|   |   # A simple wrapper to simplify emitting events with Svelte
|   |   emit.js
|   |
|   |   # The main Svelte application
|   │   Main.svelte
|   │   main.js
|
|   # Environment file for variables to be inlined into the app
|   .env / .env.staging / .env.production
|
|   # The Docker-compose files to build and run the application
|   local.builder.yml
|   local.yml
|
|   # A file to alias common build commands for Docker
|   Makefile
|
|   # The package.json for Node. This is invoked via the Docker-compose files
|   package.json
|
|   # Config files for Svelte/Webpack
|   preprocess.config.js
|   svelte.config.js
|   webpack.config.js
```

# Developing

## Installing new packages

Run the relevant `npm install ...` command and then get the change mirrored on the Docker image by running `make install`.
