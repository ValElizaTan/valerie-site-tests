# valerie-site-tests

Functional tests for [valerie-site](https://github.com/ValElizaTan/valerie-site), written in Playwright with TypeScript.

The tests run against a live deployment given by the `BASE_URL` environment variable, in Chromium only.

```sh
npm install
npx playwright install chromium
BASE_URL=https://valelizatan.github.io/valerie-site/ npm test
```

Each test name starts with the `SPEC.md` line it checks, for example `SPEC.md:5`.

Tests are written from `SPEC.md` and issue text only, never from the site's source code.
