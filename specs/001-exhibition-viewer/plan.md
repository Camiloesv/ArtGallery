# Implementation Plan: Exhibition Viewer

**Branch**: `staging` (active checkout) | **Feature**: `001-exhibition-viewer` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification in `specs/001-exhibition-viewer/spec.md`

**Constitution**: `.specify/memory/constitution.md` v2.1.0

## Summary

Extend the existing Vite/React Three Fiber gallery into a responsive, touch-capable 25-work
exhibition. Each starter wall receives its own distinct white shade. Visitors can tap/click works,
choose a work number from a navigation selector, move between works with the keyboard, and pan the
closer overview horizontally. The selector is the only 2D navigation control; it cannot edit
exhibition content. Staging and production move from Vercel to Cloudflare Pages, with `staging` as
the preview branch and `main` as the production branch.

The work stays within the current runtime stack. Configuration remains the sole source of exhibition
content. Add no backend, database, state library, or runtime dependency. Cloudflare Pages is selected
because this Vite app produces static files and Pages supports Git-connected production and branch
preview deployments. A Workers static-assets deployment is a valid alternative, but adds Worker and
Wrangler configuration without a server-side need in this project.

## Technical Context

**Language/Version**: TypeScript 5.9.3, Node.js 24.14.1; `package.json` requires Node >=22.12.0.
These are pinned in the current repository. Codio runtime compatibility remains unverified.

**Primary Dependencies**: Existing React 19.3.0, Three.js 0.183.2, `@react-three/fiber` 9.8.1,
`@react-three/drei` 10.7.9, `maath` 0.10.8, and Vite 8.3.1. Use React built-ins, existing Drei
controls/helpers where appropriate, standard CSS, and no new runtime dependency.

**Storage**: None. `src/config/exhibition.ts` remains the source of truth for station count and
content, wall colours/finishes, artwork data, and layout values.

**Testing**: Existing Vitest 5.0.3 and `@react-three/test-renderer` 9.1.1. Add test-first unit and
component coverage for configured count and white-wall uniqueness, selector contents and focus,
touch/pointer navigation behavior, overview pan bounds, responsive navigation presence, and rendered
scene configuration. Component tests remain browser-free; scene changes also require desktop and
mobile browser verification per the constitution.

**Target Platform**: Linux in the Codio sandbox for development; current desktop, tablet, and mobile
browsers with hardware-accelerated WebGL for visitors. Static staging and production deployments use
Cloudflare Pages.

**Project Type**: Existing single-page client-only Vite application. No API or server runtime.

**Performance Goals**: Preserve SC-009's 3-second interactivity target, measuring on named client
devices. Keep the overview responsive while horizontally traversing the 25-work row. Browser/GPU
performance is distinct from Codio build and test memory.

**Constraints**: Follow constitution v2.1.0: test-first; renderer tests must assert values in the
mounted scene; verify scene changes in a running browser; maintain the config/rendering/service
boundaries; all user-facing text and documentation in English; deployment content has no
environment-conditional values; Codio tooling and learner commands use Linux/POSIX conventions.

**Scale/Scope**: One configurable exhibition, 25 starter paintings, one independently configured
wall panel per painting, four named wall finishes, a numbered selector bounded by the configured
count, and a close panorama that can traverse the full row. No editing controls, backend, analytics,
or multiple exhibitions.

## Constitution Check

*GATE: Pass before implementation planning; re-check after design.*

| Gate | Result |
|---|---|
| No unjustified runtime dependency (Principle I) | **PASS** — use existing React, Vite, Three.js, Fiber, Drei, and maath only. Cloudflare Pages is hosting, not a runtime package. |
| Test-first, mounted scene assertions, and browser confirmation (Principle II) | **PASS** — add failing behavior/component tests before implementation; separately verify desktop and touch behavior in a browser. |
| Layered component/service boundaries (Principle III) | **PASS** — keep selection state in the app layer; keep camera/pan calculations separate from scene rendering; UI components receive only the props they use. |
| Configuration over code (Principle IV) | **PASS** — painting count, white shades, and wall/artwork values remain in `src/config/exhibition.ts`. |
| Pedagogical transparency and code-only editing (Principle V) | **PASS** — the selector only navigates; it cannot create a variant or change exhibition content. |
| Linux/Codio and POSIX learner workflow | **PASS with verification pending** — preserve current Vite port and Codio URL behavior; validate build, tests, memory, and runtime in Codio. |
| Cloudflare environment chain | **PASS with account setup pending** — Pages branch rules map `staging` to preview and `main` to production; user-specific account/project/domain data is not assumed. |

No constitution exception or new runtime dependency is proposed.

## Design Decisions

### Exhibition configuration

- Set the starter count to 25 and give each starter wall a unique white shade in
  `src/config/exhibition.ts`.
- Keep the existing configurable count semantics. The selector enumerates exactly the configured
  paintings, so counts below or above 25 do not create unavailable entries.
- Keep the wall and painting configuration schema in the TypeScript source. `data-model.md` is a
  planning view of the entities and validation rules, not a second authoring schema.

### Visitor navigation and responsive layout

- Add a small accessible numbered selector outside the WebGL canvas, with clear English label and
  touch target. It selects only a configured station and does not expose content editing.
- Keep click/tap focus and arrow-key navigation. Add pointer drag on desktop and horizontal swipe on
  touch screens for the close overview.
- Constrain overview travel to the row's ends. Distinguish a horizontal drag/swipe from a tap so a
  pan gesture does not accidentally focus a painting. Preserve smooth transitions to focused works
  and back to the close overview.
- Adapt the selector and canvas to narrow viewports with standard CSS. Validate keyboard access,
  touch target use, scene resizing, direct selection, pan bounds, and focused view on real browsers.

### Hosting and release flow

- Use one Cloudflare Pages project connected to the existing Git repository. Set production branch
  to `main`, and configure custom preview branch rules to include `staging` and exclude other
  branches.
- Keep Codio as the development environment. A push to `staging` updates its Pages preview; accepted
  promotion remains a fast-forward from `staging` to `main`, after which Pages deploys production.
- Keep build command/output as `npm run build` and `dist`. Verify Pages' build settings and branch
  URLs in the Cloudflare dashboard before calling deployment acceptance complete.
- Remove the obsolete `vercel.json`; branch behavior is configured in the Cloudflare Pages project.
- Do not add `wrangler`, a Worker entry point, project names, domains, account identifiers, or
  credentials to the repository unless implementation evidence shows Pages cannot meet the
  requirements. Workers static assets remains the documented fallback option.

## Phase Outline

### Phase 0 — research and target risks

Cloudflare hosting choice and branch mapping are documented in [research.md](./research.md). The
existing Windows evidence for renderer observability and package compatibility remains local-only.
Codio Node compatibility, memory, and browser performance are target checks, not presumed results.

### Phase 1 — foundation and interface contracts

The project already has the Vite/React scene, configuration, camera navigation, and component-test
structure. Extend the existing configuration and navigation boundaries. The planning model is
captured in [data-model.md](./data-model.md); browser and deployment behavior is captured in
[contracts/](./contracts/). Update [quickstart.md](./quickstart.md) for the selector, horizontal
pan, responsive/touch validation, and Cloudflare branch workflow.

### Phase 2 — user stories

1. **View the exhibition (P1)**: 25 distinct white wall shades, responsive scene, 3D overview signs,
   and horizontal panorama movement.
2. **Approach a painting (P2)**: click/tap, selector, arrow-key navigation, smooth focus/return, and
   accessible touch interaction.
3. **Restyle through code (P3)**: preserve configuration-only edits and mounted renderer tests.
4. **Use image surfaces (P4)**: preserve image/fallback and aspect-fit behavior.
5. **Extend the exhibition (P5)**: ensure the selector tracks configured count and row pan bounds
   update when the count changes.

For each behavior, add a failing test first, implement the smallest change, run relevant checks, and
perform the required browser verification for scene changes. Keep generated content and fixed
station values in the configuration module.

### Phase 3 — release validation

Verify desktop and touch browsers, responsive sizes, all numbered selections, drag/swipe distinction,
pan limits, and close overview framing. In Codio, record Node/npm versions, available memory, test
and production-build duration, and peak RSS. In Cloudflare, verify a `staging` push updates the
preview and the accepted fast-forward makes production and staging resolve to the same commit.

## Risks and Open Items

| Item | Risk / evidence needed | Handling |
|---|---|---|
| Codio runtime | Node/npm version and available memory are not confirmed from this workstation. | Record in Codio; keep target acceptance pending until build and tests complete there. |
| Browser/GPU behavior | Responsive WebGL, mobile touch events, horizontal pan, and SC-009 timing require client-browser evidence. | Test at desktop and phone/tablet viewports; keep browser/device with observed timing. |
| Gesture conflict | Dragging the overview must not trigger painting selection. | Specify and test a movement threshold and pointer/touch cancellation behavior during implementation. |
| Cloudflare project settings | Account, Pages project, repository integration, branch rules, and domains are external state and unknown. | Do not invent these values; verify dashboard configuration when deployment access is available. |
| Resource budget | Existing local build/test evidence does not establish Codio peak RSS. | Preserve the Codio measurement in research; do not infer Linux results from Windows. |
| Cloudflare Pages vs Workers | Cloudflare recommends Workers for new projects generally, while this is a static Vite SPA needing branch previews. | Prefer Pages for the direct static hosting and branch-preview fit; revisit only if Pages cannot satisfy verified release requirements. |

## Project Structure

```text
specs/001-exhibition-viewer/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── navigation.md
│   └── deployment.md
└── tasks.md                 # regenerate in the separate speckit-tasks workflow

src/
├── config/
│   ├── exhibition.ts         # authoritative station, wall, painting, and layout data
│   └── textureMemory.ts
├── components/
│   └── PaintingSelector.tsx  # visible selector; receives configured choices and callbacks
├── navigation/
│   ├── cameraTarget.ts       # pure focus target calculation
│   ├── galleryKeys.ts        # pure keyboard navigation
│   └── overviewPan.ts        # pure horizontal pan bounds/calculation
├── scene/                    # Exhibition, Artwork, Wall, WallLabel, CameraRig, MemoryPlaque
├── surfaces/                 # procedural surfaces, labels, and image fitting
├── App.tsx                   # exhibition and navigation state/orchestration
└── styles.css                # responsive selector and page layout

tests/
├── unit/                     # config, camera, key navigation, pan bounds, surfaces, memory
└── component/                # scene config propagation, selector, camera/pan interactions

public/artworks/              # configured static artwork assets
```

This remains one client-only application. No data-model or contract runtime dependency is added.

## Completion Gates

- Specification and this plan agree on all 61 functional requirements and 28 success criteria.
- Every behavior change has test-first unit/component coverage; scene changes also pass browser review.
- Selector contains exactly the configured station numbers and focuses the selected station.
- Initial overview is close, horizontal navigation spans the row, and pointer/touch gestures remain
  distinct from painting taps.
- All 25 starter wall shades are distinct whites; mobile, tablet, and desktop layouts remain usable.
- Codio runtime/build/test/resource evidence and Cloudflare preview/production commit evidence are
  recorded before claiming those environments are accepted.

## Next Phase

Run `$speckit-tasks` to reconcile the task list with this plan, then execute the locally actionable
tasks. Cloudflare account setup and deployed commit parity require the project owner's dashboard
access and cannot be verified from this checkout alone.
