# Phase 0 Research: Exhibition Viewer

**Feature**: [001-exhibition-viewer](./spec.md)
**Plan**: [plan.md](./plan.md)
**Research date**: 2026-09-30

This report separates registry evidence gathered from this workstation from runtime spikes that require the course Codio sandbox. A Windows workstation or an unavailable WSL distribution is not a substitute for that Linux environment.

## R4 — Cloudflare deployment product and branch previews (2026-10-02)

**Decision**: Use Cloudflare Pages for the existing static Vite application. Configure `main` as its
production branch and allow only `staging` as a preview branch. Keep the existing fast-forward rule
as the promotion control so production and staging point to the same accepted commit.

**Rationale**: The project builds static assets to `dist/` and has no Worker/API behavior. Cloudflare's
Pages documentation describes a Vite build using `npm run build` and `dist`, Git-connected automatic
deployment, a production branch, and configurable preview branch inclusion/exclusion. That directly
maps the current repository branch contract without adding a server runtime or deployment package.
Cloudflare currently positions Workers as its primary platform and recommends Workers for new
projects generally. Workers Builds can also deploy a Vite SPA and create previews for non-production
branches, but its Wrangler/Worker configuration is extra surface for this static-only app. Pages is
selected for the narrower fit; revisit if a verified Pages limitation prevents the required staging
preview behavior.

**Alternatives considered**:

- Workers with Static Assets and Workers Builds (not selected: broader platform, but no server logic
  is needed and branch previews are already available through Pages).
- A GitHub Actions deployment to Cloudflare (not selected: Pages Git integration supports the
  required branch builds without a separate workflow or deployment credentials in repository
  configuration).
- Keep Vercel (rejected: the clarified spec explicitly requires Cloudflare).

**Branch mapping**:

| Repository branch | Cloudflare Pages environment | Trigger |
|---|---|---|
| `staging` | Preview deployment | Push to the shared staging branch |
| `main` | Production deployment | Instructor fast-forward promotion after acceptance |
| Other branches | No deployment | Excluded by preview branch controls |

**Target verification still required**: Connect the actual repository in the user's Cloudflare
account, set `main` as the production branch, include `staging` and exclude other preview branches,
then verify a staging push and accepted fast-forward promotion. Project name, account, domains, and
credentials are deliberately not invented. A Windows/local build or a dashboard setting alone does
not prove an end-to-end deployment or same-commit result.

## R1 — Can component tests prove configuration reaches the rendered scene?

**Decision**: Keep `@react-three/test-renderer` as the candidate renderer. The positive and negative scene-graph fixture passed on Windows, so local implementation may use this strategy; Linux/Codio execution remains a target-environment verification item.

**Rationale**: The package documentation describes a Node renderer that exposes a Three.js scene graph without WebGL or a browser. That makes it a plausible match for Constitution Principle II and FR-024–FR-026, but documentation is not evidence that the exact assertion distinguishes a config value applied to a mesh from one ignored by the component.

**Alternatives considered**: Assert only component props (rejected: it does not prove the value reached the rendered result); use a browser/WebGL test (rejected: conflicts with the constitution's browser-free component-test tier); accept the package documentation without a spike (rejected: the plan identifies this as its highest-risk assumption).

**Required Codio evidence**: In a throwaway fixture outside the repository, mount a component that reads a config value and applies it to a mesh; assert the value on the rendered scene graph; then alter the component to ignore that value and show the same assertion fails. Record exact command, assertion/API, and both outcomes. If the negative control passes, stop and renegotiate FR-026 before implementation.

**Local Windows result (2026-09-30)**: Passed on Node v24.14.1 and npm 11.11.0, using a temporary fixture outside the repository with React 19.3.0, `@react-three/fiber` 9.8.1, `@react-three/test-renderer` 9.1.1, and Three.js 0.183.2. The positive scene-graph assertion read material color `0xff0000`; the negative control changed the rendered material to `0x0000ff`, and the same assertion detected the ignored configuration. `npm install` succeeded. The run emitted only a Three.js `Clock` deprecation warning. This validates the assertion strategy on Windows; it does not establish Linux/Codio behavior. WSL is unavailable on this workstation (`wsl.exe --status` reports no installed distributions), consistent with the clarification to use Windows without emulation.

## R2 — Node/npm and package compatibility

**Decision**: The package versions listed in `plan.md` exist in the npm registry and their declared peers are mutually compatible around React 19, Fiber 9, and drei 10. The complete candidate toolchain installed and ran on **Node 24.14.1/npm 11.11.0**; use that exact Node in `.nvmrc` and require Node >=22.12.0 in `engines`. Confirm Codio can use a compatible runtime before target acceptance.

**Rationale**: The registry metadata reports Vite 8.3.1 requires Node `^20.19.0 || >=22.12.0`, and Vitest 5.0.3 requires Node `^22.12.0 || ^24.0.0 || >=26.0.0`. Their intersection excludes Node 20 and early Node 22 releases. Fiber 9.8.1 accepts React `>=19 <19.4`; drei 10.7.9 accepts React `^19` and Fiber `^9.0.0`; test-renderer 9.1.1 accepts React `^19.0.0` and Fiber `>=9.0.0`. Vite 8.3.1 accepts Vitest's Vite peer range (`^8.0.0`). The plan's looser “Node 22 LTS or later” wording therefore needs the minimum patch release.

**Registry snapshot (queried 2026-09-30)**:

| Package | Candidate | Registry status | Relevant compatibility |
|---|---:|---|---|
| `react` | 19.3.0 | Exists; latest tag | Fiber/test-renderer peers accept React 19 |
| `@react-three/fiber` | 9.8.1 | Exists; latest tag | React `>=19 <19.4`; Three `>=0.156` |
| `@react-three/drei` | 10.7.9 | Exists; latest tag | React `^19`; Fiber `^9.0.0`; Three `>=0.159` |
| `maath` | 0.10.8 | Exists; latest tag | Three and `@types/three` `>=0.134.0` |
| `vite` | 8.3.1 | Exists; latest tag | Node `^20.19.0 || >=22.12.0` |
| `@react-three/test-renderer` | 9.1.1 | Exists; latest tag | React `^19.0.0`; Fiber `>=9.0.0`; Three `>=0.156` |
| `vitest` | 5.0.3 | Exists; latest tag | Node `^22.12.0 || ^24.0.0 || >=26.0.0`; Vite `^6.4.0 || ^7.0.0 || ^8.0.0` |
| `typescript` | 5.9.3 | Exists | Node `>=14.17`; retained instead of the registry's current 7.0.2 per the plan's ecosystem-risk decision |

**Alternatives considered**: Keep “Node 22 LTS or later” (rejected: it permits releases below both tool requirements); upgrade TypeScript to 7.0.2 because it is latest (rejected: the plan deliberately chooses the established 5.x line); select another test renderer before R1 (deferred: the candidate has suitable peers and the actual scene-graph assertion is the unresolved question).

**Windows fixture result (2026-09-30)**: The complete candidate fixture installed successfully on Node v24.14.1/npm 11.11.0 with React 19.3.0, Fiber 9.8.1, test-renderer 9.1.1, Three.js 0.183.2, Vite 8.3.1, Vitest 5.0.3, and TypeScript 5.9.3. Vite's production build completed successfully in 199 ms. This is local compatibility evidence, not a Codio runtime or resource measurement.

**Required Codio evidence**: Capture `node --version`, `npm --version`, and `free -m`; verify Codio can run the pinned Node 24.14.1 toolchain or install a compatible version satisfying the declared engine range. Record successful installation there before claiming target-environment compatibility.

## R3 — Production build memory budget

**Decision**: The local Windows production build succeeds, but its memory use does not establish whether the build fits Codio. Keep a Codio build-memory measurement as a target-environment acceptance requirement; local implementation can proceed without claiming that result.

**Rationale**: Codio is documented by the plan as a 1 GB RAM environment with roughly 305 MB free. No Codio session is available from this workstation, and WSL cannot run because there is no installed distribution. Therefore neither `free -m` nor `/usr/bin/time -v` can be collected for the target environment here.

**Alternatives considered**: Measure a Windows build and extrapolate (rejected: different OS and memory limits); use the plan's estimated process costs as a result (rejected: estimates are not an observed peak RSS); install WSL during this task (rejected: it would still not reproduce the Codio sandbox or its baseline free memory).

**Required Codio evidence**: After the temporary fixture dependencies install, run its production build under `/usr/bin/time -v`; record exit status, peak RSS, and available memory. If it is killed or exceeds the available budget, evaluate only the mitigations listed in the plan (a tuned `NODE_OPTIONS` heap ceiling, esbuild minification, or reducing development dependencies) and repeat the measurement. The fixture is an early estimate, not proof of FR-043; the full build remains separately verified by T052.

## Phase 0 disposition

- Registry metadata research is complete for the candidate versions above.
- R1's scene-graph positive/negative control **passed on Windows**; its Linux/Codio execution remains unverified and must be reported as such.
- R2's local toolchain install and build **passed** on Node 24.14.1/npm 11.11.0; actual Codio runtime compatibility remains pending.
- R3's local Vite production build **passed**, but Codio peak RSS remains pending and must be verified before claiming FR-043/FR-044 resource compliance.
- R4 selects Cloudflare Pages based on its documented static Vite build and branch-preview controls; actual Git integration, branch settings, and deployed commit parity remain unverified until configured in the project owner's account.
- SC-009 remains a later browser measurement after the working exhibition exists; it is not a Phase 0 result.
- Plan/task naming must consistently reserve R1 for renderer observability, R2 for toolchain/runtime compatibility, R3 for build memory, and R4 for Cloudflare deployment choice.

## Local implementation evidence — overview presentation (2026-09-30)

- Added a neon “C1 Art Gallery” 3D title, a 3D arrow-instruction sign that is hidden while an artwork is focused, and a radial black-to-grey gallery backdrop.
- Extended the texture-memory estimate to account for the generated backdrop and scene-sign textures, and documented the assumptions in `quickstart.md`.
- Test-first evidence: the new sign, backdrop, and memory assertions failed before implementation; the focused component/unit set passed after implementation. The full Windows suite reports 35 tests passing. Lint, typecheck, formatting, and the production build passed locally.
- Constitution review: React state remains in `src/App.tsx`; scene composition consumes focus state, surface modules generate textures, and no runtime dependency or 2D editing control was added. The implementation stays within the existing layered stack.
- The production build still emits Vite's existing large-chunk warning (1,125.31 kB minified JavaScript). This local build is not Codio memory evidence.
- The local dev server returned HTTP 200 on `localhost:5173`. The in-app browser policy denied navigation for visual inspection, so no visual pass is claimed. Codio and browser verification remain pending.

## Local implementation evidence — responsive exhibition navigation (2026-10-02)

- Added the 25th configured station and verified all 25 starter walls have unique shades whose RGB channels are at least 224. Starter walls use the light plaster finish so their configured white differences remain visible in the scene.
- Replaced the fit-the-whole-row overview with a closer target and horizontally bounded pointer pan. The overview signs follow the visible section and scale around their own visual centre on narrow viewports.
- Added a navigation-only selector listing the configured stations; browser review selected Painting 25 and confirmed the camera focused it, then returned to Overview.
- Added mounted scene coverage for drag-sized clicks, narrow viewport sign scaling, and sign positioning. Pointer dragging in an emulated 390 × 844 viewport moved the row while the selector remained at Overview. This is pointer-drag validation in an emulated phone viewport, not physical touch-device validation.
- Browser visual review: Codex in-app Chromium, 1280 × 720 default, plus emulated 768 × 1024 tablet and 390 × 844 phone viewport sizes. The overview showed the title, arrow instructions, responsive selector, and fewer than 25 paintings; the phone selector sits in the lower safe-area region. Selecting Painting 25 focused the matching artwork.
- `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` pass locally. The build still reports the large JavaScript chunk warning (1,127.10 kB minified). Runtime compatibility and memory on the Linux/Codio course sandbox remain unverified.
- Cloudflare Pages configuration is documented and `vercel.json` is removed. The Cloudflare account's Git integration, branch settings, preview URL, and production/staging commit identity are unverified because this checkout has no Cloudflare dashboard session or project credentials.

## Sources

- npm registry metadata for the exact package manifests, queried 2026-09-30: `https://registry.npmjs.org/<package>/<version>` for each table entry. Metadata inspected: `dist-tags`, `engines`, and `peerDependencies`.
- `@react-three/test-renderer` npm package documentation: https://www.npmjs.com/package/%40react-three/test-renderer (describes Node scene-graph snapshots without WebGL/browser; does not replace the required negative-control spike).
- Repository constraints: `.specify/memory/constitution.md`, `specs/001-exhibition-viewer/spec.md`, and `specs/001-exhibition-viewer/plan.md`.
- Cloudflare Pages [Vite build guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/) (build command/output, Git deployments, branch previews; documentation last updated 2026-04-21).
- Cloudflare Pages [branch deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) (production branch and include/exclude preview branch rules; last updated 2026-04-21).
- Cloudflare [Pages framework guide index](https://developers.cloudflare.com/pages/framework-guides/) (current recommendation that Workers is the primary platform for new projects; last updated 2026-08-21).
- Cloudflare Workers [Vite plugin overview](https://developers.cloudflare.com/workers/vite-plugin/) and [static assets](https://developers.cloudflare.com/workers/static-assets/) (verified Workers is a viable static SPA alternative; last updated 2026-09-30 and 2026-07-03).
