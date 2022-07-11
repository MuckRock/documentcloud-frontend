# DocumentCloud frontend

The main frontend for DocumentCloud, written in [Svelte](https://svelte.dev/).

## Usage

This project is a standard Node project but wrapped to run in Docker compose. In order to use this project, [Squarelet](https://github.com/muckrock/squarelet) and [DocumentCloud (Django)](https://github.com/muckrock/documentcloud) must already be up and running, following the steps in their READMEs.

In order to install, run:

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

## Building for production

Run `make build` to build the production version of the app. The project will be output in the `public` directory.

## Architecture

See the [Wiki](https://github.com/MuckRock/documentcloud-frontend/wiki) for information on the DocumentCloud architecture.

# Developing

## Installing new packages

Run the relevant `npm install ...` command and then get the change mirrored on the Docker image by running `make install`.
