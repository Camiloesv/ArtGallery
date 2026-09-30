# Implementation Plan: Exhibition Viewer

**Branch**: `001-exhibition-viewer` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-exhibition-viewer/spec.md`

**Constitution**: `.specify/memory/constitution.md` v2.1.0

## Summary

A single-page WebGL exhibition that students restyle by editing one TypeScript configuration file,
proving the change with a test suite, and shipping it through a three-environment chain: a Codio
Linux sandbox for development, a Vercel preview built from the shared `staging` branch, and a Vercel
production deployment built from `main` after the instructor accepts the change.

The technical approach is deliberately thin. Every visual parameter is data in one config file; each
station owns its wall and painting values, and the scene reads that data and nothing else. There is
no editor, no backend, no database, and no environment-conditional configuration, so the same config
file produces the same exhibition in all
three environments. The interesting engineering is not the rendering — it is the test strategy that
can prove a configuration change actually reached the render without a browser, which is the
constraint the constitution imposes and the one most likely to fail.

## Technical Context

**Language/Version**: TypeScript 5.9.3 on Node 24.14.1 (`.nvmrc`); `package.json` must require Node
>=22.12.0, the minimum intersection required by Vite 8.3.1 and Vitest 5.0.3. This exact version and
the full candidate toolchain passed installation/build checks on the available Windows host. Codio's
runtime remains unverified and must be checked before claiming target-environment compatibility.

**Primary Dependencies** (versions current at plan time, 2026-09-30, from the npm registry):

| Package | Version | Role | Constitution basis |
|---|---|---|---|
| `react` | 19.3.0 | UI runtime | Tech Constraints |
| `@react-three/fiber` | 9.8.1 | Declarative Three.js renderer | Tech Constraints (mandatory) |
| `@react-three/drei` | 10.7.9 | 3D text, camera helpers, asset loading | Tech Constraints (MAY) |
| `maath` | 0.10.8 | Easing and damping math | Tech Constraints (permitted source) |
| `vite` | 8.3.1 | Build tool | Tech Constraints (mandatory) |

`@react-three/fiber` is the only rendering path. Imperative scene mutation from outside the React
lifecycle is prohibited by the constitution, so Three.js objects are never reached for directly.

**Dev-only dependencies** (not runtime, therefore outside the Principle I runtime budget):

| Package | Version | Role |
|---|---|---|
| `@react-three/test-renderer` | 9.1.1 | Component tests without WebGL |
| `vitest` | 5.0.3 | Test runner |
| `typescript` | current | Typecheck |

**Storage**: none. No database, no backend, no server-side state. The exhibition configuration file in
the repository is the entire data layer.

**Testing**: Vitest with `@react-three/test-renderer`. Two tiers, matching the two clauses of
constitution Principle II:

- **Component tier** — mounts the real fiber tree and asserts the scene graph carries the configured
  values. No WebGL context, no browser, no `jsdom` canvas stub. This tier is what proves FR-024,
  FR-025, and FR-026.
- **Manual browser tier** — a change touching a scene component is confirmed in the running Codio
  dev server before it counts as done. The constitution declares component tests necessary but not
  sufficient, and this is the half that is not automated.
- **Keyboard navigation tier** — pure key-to-station movement is tested without the renderer; the
  camera integration remains covered by mounted CameraRig assertions and manual browser review.

**Target Platform**: Linux in a Codio sandbox (constitution v2.1.0). POSIX shell for all student-facing
scripts. Client-side WebGL 2, no SSR. Deployed as a static build to Vercel.

**Project Type**: single-page client-only web application. No API, no second deployable.

**Performance Goals**: 60 fps while orbiting the overview, at the configured painting count. Scene
interactive within 3 seconds of the load event completing (SC-009). **Both figures are provisional.**
The 60 fps target was written before the course sandbox was known and is now treated as a hypothesis
to be measured, not a commitment. The sandbox has 8 cores but 1.0 GB RAM with only ~305 MB free, and
the frame rate depends on the student's own machine and GPU, which this plan cannot see.

**Sandbox budget**: the development sandbox is Ubuntu 22.04.3 LTS, 8 cores, 1.0 GB RAM, roughly
305 MB free, user `codio`, working directory `/home/codio/workspace`. The browser runs on the
student's machine, not in the sandbox, so the budget covers the toolchain only:

| Process | Sandbox cost | Risk |
|---|---|---|
| Vite dev server | ~250–400 MB | tight but workable |
| Vitest + `@react-three/test-renderer` | ~200–400 MB | tight, and R1 must run here |
| Rollup production build | peaks 500 MB+ | **most likely to be OOM-killed** |

Disk is not a constraint at 4.3 GB free, so `node_modules` at a few hundred megabytes is fine.

**Constraints**: no state-management library (React built-ins only, Principle I); no SSR; no runtime
dependency on third-party asset services; procedural Canvas 2D surfaces; all user-facing strings,
identifiers, comments, and docs in English; no visual authoring interface of any kind.

**Scale/Scope**: one exhibition, 24 paintings as the configurable default, each station with an
independent coloured wall and painting. Four named wall finishes are available. The memory estimate
allows one generated wall texture and up to two configured image textures per station. The count is
configuration, not a constant.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Result |
|---|---|---|
| G1 | No runtime dependency outside the constitution stack. | **PASS** — five runtime packages, every one named in Tech Constraints. The three dev-only packages do not count against Principle I. |
| G2 | Every behavior preceded by a test observed failing (Principle II). | **PASS for the renderer assertion strategy** — R1's positive/negative scene-graph spike passed on Windows; retain Codio/Linux verification as a target check. |
| G3 | Component tests run without a real browser or graphics context (Principle II v1.1.0). | **PASS locally** — `@react-three/test-renderer` mounted a scene without WebGL; verify the suite again in Codio for target compatibility. |
| G4 | Layered boundaries (Principle III). | **PASS** — config, surfaces, scene, and navigation are separate and navigation math is pure. |
| G5 | Configuration over code (Principle IV). | **PASS** — `src/config/exhibition.ts` is the sole authoring surface; no exhibition value appears in a component. |
| G6 | No state-management library (Principle I). | **PASS** — `useState` and `useReducer` only. |
| G7 | No visual editing interface (Principle V as amended in v2.0.0). | **PASS** — no controls, no drawer, no manipulator. All text is 3D in-scene per FR-007. |
| G8 | Linux and POSIX shell only (constitution v2.1.0). | **PASS** — student tooling targets Linux/POSIX. The repository's PowerShell Spec Kit scripts are operator tooling, not student tooling. |
| G9 | No dead code, commented-out blocks, or unused exports (Principle V). | **PASS** — enforced by lint and the review gate. |
| G10 | English throughout. | **PASS** — all identifiers, comments, and UI strings. |

**Verdict: PASS for local development.** Codio runtime, network preview, and memory acceptance remain
target-environment checks. No violations requiring a Complexity Tracking entry.

## Risks

These are ordered by the probability that they invalidate work already done, not by effort.

**R1 — preserve scene-graph assertions in the full suite.** The temporary positive/negative
scene-graph spike passed on Windows using `@react-three/test-renderer`. Constitution v1.1.0 and
FR-026 require tests to observe rendered values and fail when rendering ignores valid configuration.
Keep the tested scene-graph assertion (never substitute a props-only assertion) and verify the full
suite on Codio as part of target acceptance.

**R2 — the Codio Node/npm runtime is unverified.** Registry metadata confirms Vite 8.3.1 and
Vitest 5.0.3 require Node >=22.12.0 (or supported later major versions). The local Node 24.14.1/npm
11.11.0 fixture passed; Codio must be checked for the pinned or compatible runtime before target
acceptance.

**R3 — production build memory is unmeasured in Codio.** A local Windows build passed, but it does not
predict Codio resource use. The course sandbox has 1.0 GB RAM with ~305 MB free. The Rollup
production build is the process most likely to be OOM-killed, which FR-043 requires not to happen.
Measure a temporary fixture under `/usr/bin/time -v` and determine whether a tuned-down
`NODE_OPTIONS=--max-old-space-size` ceiling, esbuild minification, or fewer dev-only dependencies are
needed before claiming Codio memory acceptance. If the build cannot fit, resolve the constraint
rather than report the target as verified.

TypeScript remains on the established 5.x line (5.9.3 in the registry snapshot). Although npm
reports 7.0.2 as current, do not adopt it mid-course on a teaching artifact; the ecosystem surface
for it is thinner and students will hit friction unrelated to the lesson.

**R4 — Vercel preview and production URLs differ, so "identical build output" must be read as
identical *content from an identical commit*, not identical URL.** FR-030 and FR-042 are satisfied by
the fast-forward rule: both deployments are built from one commit. The student comparing the two
environments sees the same exhibition at two addresses. State this in the quickstart so nobody
reports it as a bug.

**R5 — the shared staging branch means a student's submission can be replaced seconds after it lands.**
FR-037 and FR-038 already state this. The risk is that a student still reports it as a bug on day
one. Cover it in the quickstart and in the first exercise brief, not just the spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-exhibition-viewer/
├── spec.md              # the specification
├── plan.md              # this file
├── research.md          # Phase 0 evidence, decisions, and explicitly pending Codio spikes
├── quickstart.md        # student-facing setup and the shared-branch warning
└── tasks.md             # Phase 2 output, from /speckit.tasks
```

**No data-model.md and no contracts/ directory.** The Spec Kit template lists both, and both are
omitted deliberately. This project has no database, no backend, and no API, so there is nothing to
model and no contract to negotiate.

The exhibition configuration type is the one artifact that plays that role, and it belongs in
`src/config/exhibition.ts` rather than in a Markdown file that would drift from it. A second
description of the type is a second source of truth, which FR-003 forbids in substance even if the
disagreement is only documentation. TypeScript validates the type at compile time; a document does
not. The real validation is T012, which tests the type's rejection and acceptance rules.

### Source Code (repository root)

```text
src/
├── config/
│   └── exhibition.ts        # THE ONLY authoring surface. Types + the starter exhibition.
├── navigation/
│   ├── cameraTarget.ts      # pure viewpoint math; no React, no three imports
│   └── galleryKeys.ts       # pure arrow-key to station navigation; no React, no Three.js imports
├── surfaces/
│   └── generateSurface.ts   # Canvas 2D procedural finish; pure function returning a texture
├── scene/
│   ├── Exhibition.tsx       # composes walls, artworks, lighting
│   ├── Wall.tsx             # one panel, finish precedence lives in the caller
│   ├── Artwork.tsx          # frame, image-or-fallback surface, matte
│   ├── WallLabel.tsx        # 3D text: number, title, artist, year
│   └── CameraRig.tsx        # damped transition, reduced-motion aware
├── App.tsx
└── main.tsx

tests/
├── unit/
│   ├── cameraTarget.test.ts
│   ├── exhibitionConfig.test.ts
│   ├── fitAspectRatio.test.ts
│   ├── galleryKeys.test.ts
│   ├── generateSurface.test.ts
│   └── textureMemory.test.ts
└── component/
    ├── Artwork.test.tsx     # mounts and asserts painting colour and frame
    ├── ArtworkImage.test.tsx # asserts image fitting and colour fallback
    ├── Wall.test.tsx        # asserts wall colour, finish and image precedence
    ├── WallLabel.test.tsx   # asserts 3D text carries the metadata
    ├── Exhibition.test.tsx  # asserts each station's wall config and layout reach the render
    └── CameraRig.test.tsx   # asserts focus/overview target and reduced-motion duration

vercel.json                  # branch mapping, if defaults are insufficient
index.html
```

**Structure Decision**: single project, not a frontend/backend split. There is no backend to split off,
and creating an empty one would violate Principle I. The directory layout encodes the constitution's
layering rather than a generic template: `config` cannot import from `scene` because nothing in
`navigation` or `surfaces` imports React, which makes the boundary checkable by eye and by lint.

## Environment Chain

| Environment | Source | Trigger | Who promotes |
|---|---|---|---|
| Development | Codio sandbox, working branch | file save | student |
| Staging | `staging` branch | `git push` | student |
| Production | `main` branch | student PR request, then instructor `git merge --ff-only` | instructor only |

Vercel deploys every branch as a preview and `main` as production, so the branch topology in the spec
maps to the host with no build script and no manual deploy step. The fast-forward rule (FR-042) is
what keeps the two deployments built from one commit, which is what makes staging an exact preview
(FR-030, SC-019).

## Open Items

**O1 — performance figures are unmeasured.** SC-009 requires recording the browser and client
device when the working exhibition is measured in T027. The 60 fps
overview target in this plan also has no measured basis. Do not report either as a guarantee.

**O2 — the Codio sandbox Node version is unconfirmed** (R2). Verify compatibility before claiming
target-environment acceptance.

**O3 — Vercel project and domain names are unassigned.** The plan does not invent them.

**O4 — texture resolution is now specified at 512×512 by default** (FR-046) with a memory report
(FR-047), but the figure was chosen from the arithmetic in R3 before anything was rendered. It is a
defensible starting point, not a measured one.

## Next Phase

Phase 0 findings are recorded in `research.md` under Decision, Rationale, and Alternatives
considered. Registry research, the local renderer spike, and a local production build are complete.
Local implementation may proceed on the verified Windows toolchain. Codio runtime, preview-network,
test-suite, and memory checks remain required before claiming the sandbox acceptance criteria
(FR-043–FR-045) are met.
