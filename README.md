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
