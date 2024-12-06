# Changelog

Significant changes to DocumentCloud's frontend will be noted in this file. We also announce new features in MuckRock's regular [Release Notes](https://www.muckrock.com/news/archives/?tags=115608) column.

DocumentCloud is a running application used by thousands of journalists around the world, so updates here are organized by date, not by version number. The goal of this file is to keep a record of features added, updated and removed.

## 2024-12-06 Viewer search imrpovements and post-launch bugfixes

- Viewer search now uses Solr and displays results in a dedicated mode (`?mode=search`), so results can be linked and shared.
-

## 2024-12-02 DocumentCloud on SvelteKit released

This is the latest iteration of DocumentCloud, bringing the frontend to SvelteKit and updating the UI.

Our goals:

- Clean up the user interface to provide a consistent experience that scales across devices.
- Server-render pages, making them faster to load and easier to share.
- Simplify the application’s logic to make it easier to reason about its structure, reactivity and state, and make it easier to support new features.
- Modernize our technologies and development practices to speed up development, ensuring high-quality, bug free code from the start.
