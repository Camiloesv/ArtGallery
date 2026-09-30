# Implementation Plan: Exhibition Viewer

**Branch**: `001-exhibition-viewer` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-exhibition-viewer/spec.md`

**Constitution**: `.specify/memory/constitution.md` v2.1.0

## Summary

A single-page WebGL exhibition that students restyle by editing one TypeScript configuration file,
proving the change with a test suite, and shipping it through a three-environment chain: a Codio
Linux sandbox for development, a Vercel preview built from the shared `staging` branch, and a Vercel
production deployment built from `main` after the instructor accepts the change.

The technical approach is deliberately thin. Every visual parameter is data in one config file; the
scene reads that data and nothing else. There is no editor, no backend, no database, and no
environment-conditional configuration, so the same config file produces the same exhibition in all
three environments. The interesting engineering is not the rendering — it is the test strategy that
can prove a configuration change actually reached the render without a browser, which is the
constraint the constitution imposes and the one most likely to fail.

## Technical Context

**Language/Version**: TypeScript 5.x (npm reports 7.0.2 as current; see risk R3) on Node 22 LTS or
later. The Codio sandbox Node version is **unverified** and must be confirmed during Phase 0 before
any dependency is pinned. Pin the project with an `.nvmrc`.

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

**Target Platform**: Linux in a Codio sandbox (constitution v2.1.0). POSIX shell for all student-facing
scripts. Client-side WebGL 2, no SSR. Deployed as a static build to Vercel.

**Project Type**: single-page client-only web application. No API, no second deployable.

**Performance Goals**: 60 fps while orbiting the overview, at the configured painting count. Scene
interactive within 3 seconds of the load event completing (SC-009, baseline hardware still unconfirmed
— see open item O1).

**Constraints**: no state-management library (React built-ins only, Principle I); no SSR; no runtime
dependency on third-party asset services; procedural Canvas 2D surfaces; all user-facing strings,
identifiers, comments, and docs in English; no visual authoring interface of any kind.

**Scale/Scope**: one exhibition, 24 paintings as the configurable default, four named wall finishes,
one material slot per artwork. The count is configuration, not a constant.

## Constitution Check

*GATE: must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Gate | Result |
|---|---|---|
| G1 | No runtime dependency outside the constitution stack. | **PASS** — five runtime packages, every one named in Tech Constraints. The three dev-only packages do not count against Principle I. |
| G2 | Every behavior preceded by a test observed failing (Principle II). | **PASS with a risk** — see R1. The strategy is sound only if `@react-three/test-renderer` exposes enough scene graph to assert FR-025. Unverified until the Phase 0 spike. |
| G3 | Component tests run without a real browser or graphics context (Principle II v1.1.0). | **PASS** — `@react-three/test-renderer` is designed for exactly this. Must be confirmed in the spike, not assumed. |
| G4 | Layered boundaries (Principle III). | **PASS** — config, surfaces, scene, and navigation are separate and navigation math is pure. |
| G5 | Configuration over code (Principle IV). | **PASS** — `src/config/exhibition.ts` is the sole authoring surface; no exhibition value appears in a component. |
| G6 | No state-management library (Principle I). | **PASS** — `useState` and `useReducer` only. |
| G7 | No visual editing interface (Principle V as amended in v2.0.0). | **PASS** — no controls, no drawer, no manipulator. All text is 3D in-scene per FR-007. |
| G8 | Linux and POSIX shell only (constitution v2.1.0). | **PASS with a risk** — see R2. The Spec Kit scripts in this repository are PowerShell, authored on Windows. They are operator tooling, not student tooling, but the distinction must stay explicit. |
| G9 | No dead code, commented-out blocks, or unused exports (Principle V). | **PASS** — enforced by lint and the review gate. |
| G10 | English throughout. | **PASS** — all identifiers, comments, and UI strings. |

**Verdict: PASS.** Two gates carry unverified risk (G2, G3, G8) and are the first items in Phase 0. No
violations requiring a Complexity Tracking entry.

## Risks

These are ordered by the probability that they invalidate work already done, not by effort.

**R1 — `@react-three/test-renderer` may not expose enough to satisfy FR-025 and FR-026.** This is the
single highest risk in the project. Constitution v1.1.0 requires component tests that mount the render
and assert the configured values are carried, and the spec doubles down: FR-026 requires the suite to
fail when the rendering *ignores a valid configuration*. That means the test must observe the scene
graph, not merely a call argument. If the test renderer only gives a serialized tree too shallow to
distinguish "honoured" from "ignored", the whole test strategy in the spec is unimplementable as
written. **Spike this in Phase 0 before writing any other test.** If it fails, escalate: either the
component structure must expose a testable seam, or FR-026 has to be renegotiated. Do not paper over
it by asserting on props.

**R2 — the Codio sandbox Node version is unknown.** Every version in the table above is current on a
Windows machine running Node 24. The sandbox may ship an older Node that Vite 8 or Vitest 5 will not
support. Confirm during Phase 0 and pin with `.nvmrc` plus an `engines` field.

**R3 — TypeScript 7 is the native port, not a drop-in for the 5.x line.** The registry reports 7.0.2 as
current. Do not adopt it mid-course on a teaching artifact; the ecosystem surface for it is thinner
and students will hit friction unrelated to the lesson. Pin TypeScript 5.x explicitly.

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
├── research.md          # Phase 0 output — R1 spike results, peer-compat matrix
├── data-model.md        # Phase 1 output — the exhibition config type
├── quickstart.md        # Phase 1 output — student-facing setup and the shared-branch warning
├── contracts/           # Phase 1 output — config schema contract
└── tasks.md             # Phase 2 output, from /speckit.tasks (not created here)
```

### Source Code (repository root)

```text
src/
├── config/
│   └── exhibition.ts        # THE ONLY authoring surface. Types + the starter exhibition.
├── navigation/
│   └── cameraTarget.ts      # pure viewpoint math; no React, no three imports
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
│   └── generateSurface.test.ts
└── component/
    ├── Artwork.test.tsx     # mounts, asserts surface precedence and fallback
    ├── WallLabel.test.tsx   # asserts 3D text carries the metadata
    └── Exhibition.test.tsx  # asserts config reaches the render; breaks if rendering ignores it

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
| Production | `main` branch | instructor `git merge --ff-only` | instructor only |

Vercel deploys every branch as a preview and `main` as production, so the branch topology in the spec
maps to the host with no build script and no manual deploy step. The fast-forward rule (FR-042) is
what keeps the two deployments built from one commit, which is what makes staging an exact preview
(FR-030, SC-019).

## Open Items

**O1 — SC-009 names no hardware.** "Typical student laptop" is the only success criterion in the spec
that cannot be verified. The plan assumes a 2019-class integrated-graphics laptop for the 3-second
budget. This is an assumption, not a measurement, and the instructor should replace it with the
actual course hardware before `/speckit.tasks`.

**O2 — the Codio sandbox Node version is unconfirmed** (R2). Blocking for pinning.

**O3 — Vercel project and domain names are unassigned.** The plan does not invent them.

## Next Phase

`/speckit.research` — the R1 spike runs first and alone. Nothing else in this plan is worth
implementing until it reports whether component tests can distinguish "configuration honoured" from
"configuration ignored".
