# Exhibition Viewer Quickstart

## Run the gallery

Use Node.js 24.14.1 (or another release accepted by `package.json`), then install and start Vite:

```sh
npm ci
npm run dev
```

In Codio, Vite listens on `0.0.0.0:5000`. Keep the server process running in its terminal. Codio
publishes the port using its generated URL; do not hard-code the workspace hostname. For a
background process, run `nohup npm run dev > /tmp/exhibition-vite.log 2>&1 &` and inspect the log
if the preview does not appear. The Codio runtime, public preview, available-memory baseline, and
process start time still need confirmation in the course sandbox.

## Change the exhibition

Edit only `src/config/exhibition.ts`:

- `count` controls how many configured stations are rendered; it cannot exceed the station list.
- `spacing` controls the distance between adjacent stations.
- `surfaceResolution` controls the generated texture resolution (default 512 × 512).
- Each station carries its title, artist, year, position, painting color, optional image path and
  aspect ratio, plus its own wall configuration.
- Each station's wall carries its distinct color, roughness, finish, and optional image path and
  aspect ratio. The 25 starter walls each use a different shade of white. Changing one wall cannot
  change another station's wall.
- Four local wall finishes are available: plaster, concrete, limewash, and slate. An unknown name
  falls back to matte plaster.

Use the visible numbered selector to jump to a configured painting. Its options show only the
numbers from 1 through the configured count (1 through 25 in the starter exhibition), and change to
follow the count if the configuration is edited. Use the separate **Overview** button or the up
arrow to return to the panorama. The selector navigates only; it does not edit exhibition data.

Use the left and right arrow keys to move between artworks; from the overview, right opens the first
artwork and left opens the last. Focus remains on the first or last artwork at each row boundary.
Press up to return to the closer overview. Drag horizontally with a mouse or swipe on a touch screen
to explore the rest of the row; a pan gesture must not select a painting accidentally. Tap a visible
painting to focus it.

The overview includes the neon “C1 Art Gallery” title, a 3D sign for the arrow keys, and a radial
black-to-grey fade behind the exhibition. Both signs disappear while an artwork is focused.

The in-scene plaque reports an estimated RGBA texture budget. It includes a generated wall texture
and label for every station, the gallery backdrop and signs, the memory plaque, and up to one wall
image and one artwork image for every station. Optional image slots are estimated at the configured
surface resolution. Artwork fallback colors do not allocate a texture. This is an estimate, not a
measurement of browser GPU allocations.

Run the local checks before submitting:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Cloudflare Pages staging and instructor promotion

All students submit to the shared `staging` branch. Pull the latest branch before starting or pushing;
another student's push replaces the exhibition currently shown in staging. A submission is ephemeral
there, so do not assume it will remain visible.

After completing the exercise, open a pull request from `staging` to `main` and request instructor
promotion. The instructor must verify that the PR head is the exact accepted commit that passed in
staging, then fast-forward `main` to that commit. If another submission has changed `staging`, review
the new head and repeat staging validation before promotion. Do not create a merge commit: production
and staging must resolve to the same commit.

Configure the Cloudflare Pages project with `main` as the Production branch and custom preview branch
rules that include `staging` and exclude other branches. Use `npm run build` as the build command and
`dist` as the output directory. Confirm in the Cloudflare dashboard that a staging push updates the
preview deployment and that an accepted fast-forward to `main` updates production to the same commit.
The project name, account, domains, and credentials are supplied by the project owner; do not guess
them. Local build success does not verify the hosted deployments.
