# DocumentCloud frontend

**DocumentCloud Frontend** &middot; [Squarelet][squarelet] &middot; [MuckRock][muckrock] &middot; [DocumentCloud][documentcloud]

The main frontend for DocumentCloud, written in [SvelteKit](https://kit.svelte.dev/).

## Usage

### Local Stack

It's possible to run all the dependencies for this project completely locally, as long as you already have both [Squarelet](https://github.com/muckrock/squarelet) and the [DocumentCloud (Django)](https://github.com/muckrock/documentcloud) running in Docker containers. Follow the steps in their READMEs before setting up this project.

In order to install dependencies inside the Docker container and on your host machine, run:

```bash
make install
```

Once the node modules have been installed, start the app with:

```bash
make dev
```

Set up your hosts:

```bash
echo "127.0.0.1 www.dev.documentcloud.org" | sudo tee -a /etc/hosts
```

Once everything is up and running, you should be able to see the website live at [www.dev.documentcloud.org](http://www.dev.documentcloud.org/).

### Remote Stack

It's possible to run the frontend against the staging API, instead of a locally running API server, providing a lightweight solution for local development. The frontend needs to run on a custom localhost, `https://local.muckcloud.com`, and is exposed on the standard `5173` port used by Vite dev servers.

To run the dev server locally against the staging API, take the following steps:

1. Update your hosts file
   ```bash
   echo "127.0.0.1 local.muckcloud.com" | sudo tee -a /etc/hosts
   ```
2. Make a local certificate in a `certs` directory
   ```bash
   mkdir certs && cd certs
   mkcert -install
   mkcert local.muckcloud.com
   ```
3. Use NPM to install and run the `dev:remote` script
   ```bash
   npm install
   npm run dev:remote
   ```

Now, you should have a dev server accessible at `https://local.muckcloud.com:5173` that connects to the staging DocumentCloud API (https://api.muckcloud.com) and staging authentication service (https://squarelet-staging.herokuapp.com).

## Building for production

Run `make build` to build the production version of the app. The project will be output in the `build` directory. (This happens on Netlify and during Github Actions automatically.)

## Browser support

DocumentCloud is tested and runs on recent versions of modern browsers -- Chrome, FireFox, Safari and Microsoft Edge. Older versions of those browsers will likely work, too, but we can't guarantee a bug-free experience on versions from more than a year ago, or on browsers that no longer receive updates, such as Internet Explorer.

## Environment Variables

- Use `process.env` for things running on a development machine in a Node context, like Vite configs and other dev or build scripts.
- In SvelteKit:
  - In a server context, you can use `import {env} from "$env/dynamic/private` to access variables defined in `process.env`.
  - In a client context, you can only `import {env} from "$env/static/public` to access variables named with a `PUBLIC_` prefix.

_Learn more about using environment variables in [the SvelteKit learning docs](https://learn.svelte.dev/tutorial/env-static-private)._

## Developing

### Installing new packages

Run the relevant `npm install ...` command and then get the change mirrored on the Docker image by running `make install`.

[muckrock]: https://github.com/MuckRock/muckrock
[documentcloud]: https://github.com/MuckRock/documentcloud
[squarelet]: https://github.com/muckrock/squarelet

#### Cleaning up dependencies

We've added [knip](https://knip.dev/) to our workflow to help clean up unused files and dependencies. Run it with `npm run knip` to lint the codebase. Knip is an imperfect tool, so be sure to check for errors before committing and pushing changes. It's generally safe to leave unused files in the codebase.

### Unit tests

Run unit tests with `npm run test:unit`. Running `npm run test:watch` will re-run tests as code changes.

We use snapshots for testing component rendering. After updating Svelte components or styles, snapshot tests may fail if they're not updated. To update snapshots, run `npm run test:unit -- -u`.

### Browser tests

All of the browser test commands depend on the front end running, so start the app with `make dev` and start the backend and Squarelet as well.

### Running tests locally

Run `npm run test:browser` in another terminal. This will run Playwright using Chromium and Firefox.

### Development

The functional tests are colocated with the files they test, like this:

```
src/lib/api/
├── accounts.ts
├── addons.ts
├── collaborators.ts
├── documents.ts
├── embed.ts
├── feedback.ts
├── flatpages.ts
├── notes.ts
├── projects.ts
├── sections.ts
├── tests
│   ├── accounts.test.ts
│   ├── addons.test.ts
│   ├── collaborators.test.ts
│   ├── documents.test.ts
│   ├── embed.test.ts
│   ├── flatpages.test.ts
│   ├── notes.test.ts
│   ├── projects.test.ts
│   └── sections.test.ts
└── types.d.ts
```

Component tests use the [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/) and are also colocated near the components they test, usually in a `tests` folder.

With any change, be sure to:

- develop it on a branch
- run tests and type checks locally (`npm run test` and `npm run check`)
- ensure `npm run build` finishes without errors

Our CI process _should_ catch any regressions, but it's always worth checking things locally.

## Legacy embed scripts

Earlier interations of DocumentCloud used scripts to inject the viewer, pages and notes into other web pages. This approach has been deprecated in favor of `iframe`-based embeds, but lots of legacy embeds exist across the internet. To support these older embeds, we've rewritten the original scripts to inject an `iframe` where appropriate.

These scripts live in the `src/embeds` directory and are built with `esbuild`. They're not part of the larger SvelteKit project, so they have a separate build process that may change later. (Our main build tool, Vite, also depends on `esbuild`.)

## Storybooks

Storybooks are used to create isolated environments for developing, testing and demonstrating the Svelte components that compose the user interface.

Storybooks run locally to your machine, not in the Docker container.

To run the Storybook dev server:

```sh
npm run storybook
```

To set and manage your Node version, you can use [NVM](https://github.com/nvm-sh/nvm) or [nodenv](https://github.com/nodenv/nodenv):

```sh
node -v
nvm install 20
# or
nvm install --lts
```

## Thanks

<a href="https://www.chromatic.com/"><img src="https://user-images.githubusercontent.com/321738/84662277-e3db4f80-af1b-11ea-88f5-91d67a5e59f6.png" width="153" height="30" alt="Chromatic" /></a>

Thanks to [Chromatic](https://www.chromatic.com/) for providing the visual testing platform that helps us review UI changes and catch visual regressions.
