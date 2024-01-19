# DocumentCloud frontend

**DocumentCloud Frontend** &middot; [Squarelet][squarelet] &middot; [MuckRock][muckrock] &middot; [DocumentCloud][documentcloud]

The main frontend for DocumentCloud, written in [Svelte](https://svelte.dev/).

## Usage

This project depends on both [Squarelet](https://github.com/muckrock/squarelet) and the [DocumentCloud (Django)](https://github.com/muckrock/documentcloud). Follow the steps in their READMEs before setting up this project.

This project is a Svelte + Webpack project wrapped in Docker compose.

In order to install dependencies inside the Docker container, run:

```bash
make install
```

Once the node modules have been installed, start the app with:

```bash
make dev
```

**Warning:** Don't just run `docker compose up` like you would with some of the other repos. The containers listed in `local.yml` aren't intended to be run simultaneously.

Set up your hosts:

```bash
echo "127.0.0.1 www.dev.documentcloud.org" | sudo tee -a /etc/hosts
```

Once everything is up and running, you should be able to see the website live at [www.dev.documentcloud.org](http://www.dev.documentcloud.org/). Note the frontend is not yet functional.

## Building for production

Run `make build` to build the production version of the app. The project will be output in the `public` directory.

## Architecture

See the [Wiki](https://github.com/MuckRock/documentcloud-frontend/wiki) for information on the DocumentCloud architecture.

## Browser support

DocumentCloud is tested and runs on recent versions of modern browsers -- Chrome, FireFox, Safari and Microsoft Edge. Older versions of those browsers will likely work, too, but we can't guarantee a bug-free experience on versions from more than a year ago, or on browsers that no longer receive updates, such as Internet Explorer.

## Developing

## Installing new packages

Run the relevant `npm install ...` command and then get the change mirrored on the Docker image by running `make install`.

[muckrock]: https://github.com/MuckRock/muckrock
[documentcloud]: https://github.com/MuckRock/documentcloud
[squarelet]: https://github.com/muckrock/squarelet

## Unit tests

Run unit tests with `npm test`.

## Browser tests

All of the browser test commands depend on the front end running, so start the app with `make dev` and start the backend and Squarelet as well.

### Running tests locally

Run `npm run test:browser` in another terminal. This will run Playwright using Chromium and Firefox.

### Development

The functional tests are organized like this:

```
tests
├── README.md
├── anonymous
│   ├── manager
│   │   └── app.spec.js
│   ├── pages
│   │   └── home.spec.js
│   └── viewer
│       └── document.spec.js
└── fixtures
    ├── Small pdf.pdf
    ├── development.json
    ├── production.json
    ├── staging.json
    └── the-nature-of-the-firm-CPEC11.pdf
```

Tests are organized around major parts of the codebase -- `manager`, `pages` and `viewer`. Tests under `anonymous` don't use an authenticated user.

Tests rely on specific docouments available in each environment, which will have different URLs, so lists of known documents are provided in `development.json`, `staging.json` and `production.json`. Those correspond to the `NODE_ENV` environment variable.

## Storybooks

Storybooks are used to create isolated environments for developing, testing and demonstrating the Svelte components that compose the user interface.

Storybooks run locally to your machine, not in the Docker container.

To run the Storybook dev server:

```sh
npm run storybook
```

To set and manage your Node version, you can use [NVM](https://github.com/nvm-sh/nvm):

```sh
node -v
nvm install 16
# or
nvm install --lts
```

## Thanks

<a href="https://www.chromatic.com/"><img src="https://user-images.githubusercontent.com/321738/84662277-e3db4f80-af1b-11ea-88f5-91d67a5e59f6.png" width="153" height="30" alt="Chromatic" /></a>

Thanks to [Chromatic](https://www.chromatic.com/) for providing the visual testing platform that helps us review UI changes and catch visual regressions.
