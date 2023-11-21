# End-to-end tests

This directory includes [Playwright](https://playwright.dev) tests that run in a headless browser against a running version of the site. To run locally, start a full instance (Squarelet, the DocumentCloud API and frontend) and set the `URL` environment variable. For example:

```sh
URL=https://www.dev.documentcloud.org npx playwright test
```

Github will automatically run this against any pull request using a deploy preview, and it will set the `URL` environment variable to the correct target.
