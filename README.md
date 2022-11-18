# DocumentCloud frontend
**DocumentCloud Frontend** &middot; [Squarelet][squarelet] &middot; [MuckRock][muckrock] &middot; [DocumentCloud][documentcloud]

The main frontend for DocumentCloud, written in [Svelte](https://svelte.dev/).

## Usage

This project is a standard Node project but wrapped to run in Docker compose.

In order to install, run:

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

To utilize the frontend with its necessary authentication system and backend, [Squarelet](https://github.com/muckrock/squarelet) and [DocumentCloud (Django)](https://github.com/muckrock/documentcloud) are a requirement. Follow the steps in their READMEs.

## Building for production

Run `make build` to build the production version of the app. The project will be output in the `public` directory.

## Architecture

See the [Wiki](https://github.com/MuckRock/documentcloud-frontend/wiki) for information on the DocumentCloud architecture.

# Developing

## Installing new packages

Run the relevant `npm install ...` command and then get the change mirrored on the Docker image by running `make install`.

[muckrock]: https://github.com/MuckRock/muckrock
[documentcloud]: https://github.com/MuckRock/documentcloud
[squarelet]: https://github.com/muckrock/squarelet

## Unit tests

Run unit tests with `make test`. This will run the tests via the builder Docker image.

## Functional tests

All of the functional test commands depend on the front end running, so start the app with `make dev-app` and start the backend and Squarelet as well.

### Running tests locally

Run `make browser-test` in another terminal. This will run the `browser-test` Docker image against the running front-end app using all of the browsers, except Chromium for now.

You will need to create a user that is verified for uploading as described in the [backend documentation](muckrock/documentcloud). Then, you need to put that users credentials in a `.env.test` file in the project root that looks like this:

  TEST_USER=<the test user>
  TEST_PASS=<the password>
  APP_URL=https://www.dev.documentcloud.org/

To run the functional tests without the Docker image, run `make browser-test-direct`. This will run the test suite files via your computer's Node. It will use the webkit browser only (but you can change this in the Makefile if you like).

`make browser-test-direct` will do the same thing, except it will use all of the browsers.

The above commands run the browsers headlessly. If you want to see what's going on, you can use `make browser-test-headful`.

If you want to step through the tests with the debugger, use `make browser-test-debug`.

### Development

The functional tests are organized like this:

`tests/functional`: Common utilities for the test go here.
`tests/functional/cases`: The bodies of individual test cases.
`tests/functional/suites`: These files are the test runner entry points ([`tape`](https://github.com/ljharb/tape/) is the test runner). They use the utilties to start up and shut down the browsers via Playwright and load and run individual test cases. It may make sense to repeat some test cases across suites, like signing in, uploading a document, and deleting an uploaded document, for example.
`tests/functional/fixtures`: Artifacts and data needed by the tests go here.
