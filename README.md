# Svelte donation kiosk

A big, chunky, tablet-friendly screen for collecting donations to the
[Svelte Open Collective](https://opencollective.com/svelte). Works in portrait and landscape.

**Live:** https://khromov.github.io/open-collective-svelte-donation-link/

- Pick $5, $10, $20 or $50, one time, monthly or yearly.
- The QR code updates to the matching Open Collective donation URL; scan it and finish on your phone.
- Choosing *Monthly* or *Yearly* triggers a celebratory explosion of Rich Harris.
- After 30 seconds without a touch the screen returns to its defaults ($10, one time).

Amounts, defaults and the timeout live in [`src/lib/config.ts`](src/lib/config.ts).

## Develop

```sh
npm install
npm run dev
```

`npm run build` outputs a static site to `dist/`. Pushing to `main` deploys to GitHub Pages
via `.github/workflows/deploy.yml`.

Built with Svelte 5 and Vite, styled after [svelte.dev](https://svelte.dev).
