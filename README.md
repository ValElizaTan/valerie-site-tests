# valerie-site-tests

Functional tests for [valerie-site](https://github.com/ValElizaTan/valerie-site), written in Playwright with TypeScript.

The tests run against a live deployment given by the `BASE_URL` environment variable, for example:

```sh
BASE_URL=https://valelizatan.github.io/valerie-site/ npx playwright test
```

Tests are written from `SPEC.md` and issue text only, never from the site's source code.
