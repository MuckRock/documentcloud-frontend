# Structure

Classes to represent data like documents and projects

## `document.js`

`Document` wraps a document API response, like this: https://api.www.documentcloud.org/api/documents/1/. It's used extensively throughout the codebase. Most API functions return `Document` instances.

The `Document` class renames some fields to use camel case and has some convenience methods.

The `documents.js` module contains functions that operate on one or more documents.

## `entity.js`

`Entity` wraps a single entity returned by the entities endpoint: https://www.documentcloud.org/help/api#entities

`Entities` is a list of `Entity` instances.

## `note.js`

`Note` wraps the `notes` subresource on documents: https://api.www.documentcloud.org/api/documents/24028981/notes/2408726/

## `project.js`

`Project` wraps the `projects` endpoint and adds helper methods to add, remove and check membership of users. It renames some API fields to use camel case.

## `rectangle.js`

Unused. Can delete.

## `results.js`

Wraps a generic API list response. `Entities` extends this. Some API functions in `src/api` use this to wrap lists of results.

## `searchParams.js`

`SearchParams` is complicated. It wraps a string of search params and extracts parts. I'm not sure this needs to be a store. There are tests, at least.

## `section.js`

Wraps a document section, like this https://api.www.documentcloud.org/api/documents/24028981/sections/.
