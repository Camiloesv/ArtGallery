---
description: "Implementation tasks for the responsive exhibition viewer"
---

# Tasks: Exhibition Viewer

**Input**: Design documents in `specs/001-exhibition-viewer/`
**Branch**: `staging`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and `contracts/`
**Verification**: Tests are required by the specification and Constitution Principle II. New behavior was tested first and observed failing before implementation.

## Phase 1: Setup

**Purpose**: Confirm the existing application and test harness.

- [X] T001 Confirm the pinned Vite, React, Three.js, and Vitest toolchain and no new runtime dependencies in `package.json`.
- [X] T002 Run the baseline `npm test` suite before application behavior changes; preserve the result in `specs/001-exhibition-viewer/research.md`.

## Phase 2: Foundational

**Purpose**: No new shared infrastructure was needed; the existing React Three Fiber renderer and test setup were verified in T001–T002.

## Phase 3: User Story 1 — View the Exhibition (Priority: P1) 🎯 MVP

**Goal**: Start at a nearby, legible part of the 25-work row and pan horizontally to inspect every station.

**Independent test**: Mount the scene and confirm all 25 individually configured white walls render; verify a close overview target, bounded horizontal panning, responsive signage, and that a pan cannot select a painting.

### Tests first

- [X] T003 [P] [US1] Assert 25 starter stations and 25 distinct white wall colours in `tests/unit/exhibitionConfig.test.ts`; observe the old configuration fail.
- [X] T004 [P] [US1] Cover horizontal direction, zero movement, pan bounds, and tap threshold in `tests/unit/overviewPan.test.ts`; observe missing pan logic fail.
- [X] T005 [P] [US1] Assert the close overview distance and pan offset in `tests/component/CameraRig.test.tsx`; observe the old distant target fail.
- [X] T006 [P] [US1] Assert 25 mounted walls/artworks, narrow-viewport sign scaling, and sign placement in `tests/component/Exhibition.test.tsx`; observe each new assertion fail.

### Implementation

- [X] T007 [US1] Add the 25th station and distinct pale white starter wall colours in `src/config/exhibition.ts`.
- [X] T008 [US1] Implement bounded pointer-to-world pan conversion and gesture threshold in `src/navigation/overviewPan.ts`.
- [X] T009 [US1] Update the overview camera framing and offset target in `src/scene/CameraRig.tsx`.
- [X] T010 [US1] Add the pointer-driven pan surface and disable it in focused view in `src/scene/OverviewPanSurface.tsx` and `src/scene/Exhibition.tsx`.
- [X] T011 [US1] Connect overview offset state and initial close camera position in `src/App.tsx`.
- [X] T012 [US1] Prevent drag-sized pointer gestures from selecting artworks in `src/scene/Artwork.tsx`.
- [X] T013 [US1] Keep overview signs centred over the visible row and scale them to narrow viewports in `src/scene/Exhibition.tsx`.

**Checkpoint**: The overview renders the title, instructions, and a nearby portion of the row; pointer dragging moves the row without changing focus.

## Phase 4: User Story 2 — Approach and Select a Painting (Priority: P2)

**Goal**: Focus any configured painting using its number, a tap/click, or the existing keyboard controls.

**Independent test**: Select Painting 25 in the browser, verify the matching artwork becomes the camera target, return to Overview, and inspect accessible controls at desktop, tablet, and phone viewport sizes.

### Tests first

- [X] T014 [P] [US2] Assert the accessible selector and exactly the configured numbered options in `tests/component/PaintingSelector.test.tsx`; observe the missing component fail.
- [X] T015 [P] [US2] Assert drag-sized clicks do not call the artwork selection callback in `tests/component/Exhibition.test.tsx`; observe the callback fire before its guard was implemented.

### Implementation

- [X] T016 [US2] Implement the controlled numeric-only selector and separate overview button in `src/components/PaintingSelector.tsx`.
- [X] T017 [US2] Wire selector state to the exhibition and camera in `src/App.tsx`.
- [X] T018 [US2] Add a touch-friendly numeric selector and overview button, safe-area placement, focus visibility, and touch-safe canvas styles in `src/styles.css`.
- [X] T019 [US2] Review selection, focus transition, overview return, pointer drag, and 1280×720, 768×1024, and 390×844 viewports in the running browser; record results and the emulated-touch limitation in `specs/001-exhibition-viewer/research.md`.

**Checkpoint**: Numbered navigation works with a pointer or touch-sized control; keyboard behavior remains intact.

## Phase 5: User Story 3 — Restyle the Exhibition Through Code (Priority: P3)

**Goal**: Retain independent, configuration-driven wall and artwork appearance.

**Independent test**: Change one station's wall and artwork configuration and verify its rendered materials change without affecting other stations.

- [X] T020 [US3] Preserve configuration-driven wall and painting rendering, with per-station mounted assertions in `src/scene/Wall.tsx`, `src/scene/Artwork.tsx`, `src/scene/Exhibition.tsx`, and `tests/component/Exhibition.test.tsx`.

## Phase 6: User Story 4 — Use Image Surfaces (Priority: P4)

**Goal**: Preserve image fitting and per-artwork fallback behavior.

**Independent test**: Render a valid image without distortion and confirm an unavailable image affects only its own painting.

- [X] T021 [US4] Preserve and verify image fitting and isolated fallback in `src/scene/Artwork.tsx` and `tests/component/ArtworkImage.test.tsx`.

## Phase 7: User Story 5 — Extend the Exhibition (Priority: P5)

**Goal**: Keep scene count, numbering, selector options, and pan limits derived from configuration.

**Independent test**: Change configured counts and verify the mounted scene, selector, and bounded navigation expose exactly the configured stations.

- [X] T022 [P] [US5] Cover count decrease/increase and contiguous numbering in `tests/component/Exhibition.test.tsx`.
- [X] T023 [US5] Keep selector option generation data-driven in `src/components/PaintingSelector.tsx` and verify count-based pan endpoints in `tests/unit/overviewPan.test.ts` and `src/navigation/overviewPan.ts`.

## Phase 8: Polish and Cloudflare Release Readiness

**Purpose**: Finish deployment documentation and run local validation; hosted account validation remains a separate gate.

- [X] T024 [P] Update Cloudflare Pages build, branch, and promotion instructions in `specs/001-exhibition-viewer/quickstart.md`, `specs/001-exhibition-viewer/research.md`, and `specs/001-exhibition-viewer/contracts/deployment.md`.
- [X] T025 Remove obsolete `vercel.json` and update stale deployment notes in `specs/001-exhibition-viewer/plan.md`.
- [X] T026 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` from `package.json`.
- [ ] T027 Configure and verify the owner's Cloudflare Pages Git project, `main` production branch, `staging` preview branch, build command, and `dist` output in `specs/001-exhibition-viewer/research.md`.
- [ ] T028 Verify the deployed staging preview and production fast-forward resolve to the same commit, recording both commit IDs in `specs/001-exhibition-viewer/research.md`.
- [ ] T029 Measure SC-009 time-to-interactive on the supported Linux/Codio environment and record device/browser evidence in `specs/001-exhibition-viewer/research.md`.
- [X] T030 Review layering, test-first evidence, dependencies, and whitespace with `git diff --check`; record environment limitations in `specs/001-exhibition-viewer/research.md`.

## Dependencies and Execution Order

- Setup (Phase 1) precedes the implementation stories. The project already had its shared scene and test infrastructure, so Phase 2 adds no blocking code.
- **US1 (P1)** establishes the 25-work starter configuration, close overview, and bounded pan behavior.
- **US2 (P2)** builds on US1 camera and scene state to add numbered selection and responsive controls.
- **US3 (P3)** and **US4 (P4)** preserve existing independently testable configuration and image behaviors.
- **US5 (P5)** verifies configurable counts against the selector and pan bounds.
- Cloudflare dashboard setup, deployed commit identity, and Codio timing remain blocked on their respective external environments, not on local implementation.

### Parallel opportunities

- T003–T006 are test-only edits in distinct files and were independently authored before their corresponding implementations.
- T014 is independent selector coverage; T015 is independent gesture coverage.
- Documentation updates in T024 can be reviewed separately from local checks in T026.
- The user stories depend on the shared overview foundation; running their implementation in parallel would cause overlapping app/scene changes and is not recommended.

## Implementation Strategy

### MVP

Deliver US1: the 25 distinct white walls, close panorama, accessible scene composition, and horizontal pan. Validate with `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build`.

### Incremental delivery

1. Complete US1 and browser review.
2. Complete US2 selector and responsive navigation.
3. Preserve US3–US5 configuration, image, and count behavior.
4. Complete Cloudflare and Codio environment gates once the project account and course sandbox are available.

## Notes

- Every task follows checkbox, sequential task ID, appropriate parallel/story markers, and concrete repository file paths.
- Test tasks were run before implementation and observed failing; final suite remains green.
- No commit or push was requested or performed.
