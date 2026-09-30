---

description: "Task list for 001-exhibition-viewer"
---

# Tasks: Exhibition Viewer

**Input**: Design documents from `specs/001-exhibition-viewer/`

**Prerequisites**: plan.md, spec.md

**Deliberately absent**: `data-model.md` and `contracts/`. Both are in the Spec Kit template and both
are omitted on purpose. There is no database, no backend, and no API, so there is no model and no
contract. The exhibition configuration type plays that role and lives in `src/config/exhibition.ts`,
because a Markdown description of the type would be a second source of truth that can drift from the
one FR-003 makes authoritative. T012 is its test.

**Tests**: Required. The constitution makes Principle II non-negotiable, so the test tasks below are
not optional. Each MUST be written and observed failing before its implementation task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in every description

---

## Phase 0: Local Toolchain Spikes and Codio Evidence Tracking

**Purpose**: Establish a usable local toolchain and renderer test strategy. Codio-specific runtime,
network, and memory checks remain acceptance tasks; they do not prevent local implementation.

The available Windows host is permitted for preliminary work without Linux emulation. Label local
results as local evidence; do not report them as Codio/Linux validation.

- [x] T001 Create a temporary Vite/Vitest fixture outside the repository; record the local Node/npm
      versions, exact package versions, install result, and production-build result in
      `specs/001-exhibition-viewer/research.md`. Windows result: Node 24.14.1/npm 11.11.0; install
      succeeded and Vite build passed. Use Node 24.14.1 in `.nvmrc` and require >=22.12.0 in
      `package.json`. Codio runtime/resource verification remains in T011, T052, and T054.
- [x] T002 Spike the test strategy in the temporary fixture; build a throwaway component that reads a config value and applies
      it to a mesh, and assert with `@react-three/test-renderer` that the value appears in the scene
      graph. Then break the component so it ignores the value and confirm the assertion fails.
      **This is R1.** Completed on Windows with Node v24.14.1/npm 11.11.0; the scene assertion passed
      for the configured material and detected the ignored-config negative control. See
      `specs/001-exhibition-viewer/research.md`. This local result does not claim Codio/Linux
      validation. If the assertion cannot distinguish honoured from ignored, FR-026 is
      unimplementable as written and must be renegotiated before any story task runs. Do not
      substitute an assertion on props — that is the exact thing FR-026 exists to prevent.
- [ ] T003 In Codio, measure the temporary fixture's production-build peak memory under
      `/usr/bin/time -v`; record exit status, peak RSS, and available memory in
      `specs/001-exhibition-viewer/research.md`. This is an early Codio estimate, not proof of FR-043.
      If it is killed or exceeds the free budget, determine whether a tuned-down
      `NODE_OPTIONS=--max-old-space-size` ceiling, esbuild minification, or fewer dev dependencies
      lets it complete. **This is R3 and does not block local implementation.**
- [x] T004 Complete `specs/001-exhibition-viewer/research.md` with registry compatibility, the local
      Windows Node/npm/install/build results, the renderer positive/negative control, and explicit
      Codio evidence still pending. Measure SC-009 after the working exhibition exists in T033.

**Checkpoint**: Local renderer assertions, package installation, and production build pass on the
available Windows host. Local implementation may proceed. Codio runtime, preview networking, test
suite, and memory remain required target acceptance checks in T011, T052, and T054; if they fail,
resolve the target compatibility issue before claiming Codio acceptance.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialisation and structure

**Requirements**: FR-028 to FR-042, FR-045; SC-013 to SC-019

- [X] T005 Create the directory layout from plan.md: `src/{config,navigation,surfaces,scene}`,
      `tests/{unit,component}`, `index.html`
- [x] T006 Initialise `package.json` and `package-lock.json`, and install the runtime dependencies pinned in plan.md
      (`react`, `@react-three/fiber`, `@react-three/drei`, `maath`) and the dev-only set
      (`@react-three/test-renderer`, `vitest`, `typescript`)
- [X] T007 [P] Configure `eslint.config.js` and `.prettierrc.json`, enforcing the constitution's rules: no unused exports,
      no dead code, no bare `any`, and no import from `src/scene` into `src/config`,
      `src/navigation`, or `src/surfaces`
- [X] T008 [P] Configure `vitest.config.ts` and `tests/setup.ts` with `@react-three/test-renderer`, with a setup file that supplies no
      WebGL context. Confirm the suite runs on the local Windows host; Codio timing and memory remain in T054
- [X] T009 [P] Add `.nvmrc` and a POSIX-shell setup script for students. The constitution makes
      Windows-only tooling unacceptable, so the script must not assume PowerShell
- [ ] T010 [P] Configure `vercel.json` to enable deployment only for `staging` and `main`, with
      `staging` as preview and `main` as production (FR-039). Confirm a push to each branch produces
      the expected target in the Vercel project
- [ ] T011 [P] Configure `vite.config.ts` to bind `0.0.0.0` on port 5000 (within Codio's 1024–9499
      range), keep the process alive, and serve the preview at Codio's generated public URL (FR-045).
      In Codio, record Node/npm versions, `free -m`, the URL pattern, and observed start time.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The configuration type and the pure logic every story depends on.

**⚠️ CRITICAL**: No user story can begin until this phase is complete.

- [x] T012 Write `tests/unit/exhibitionConfig.test.ts` asserting configuration validation accepts
      an unknown finish for matte fallback, rejects a non-positive count and a duplicate position
      with a clear error, and accepts
      the starter exhibition. **This task is the executable contract for the configuration shape,
      and replaces the data-model document the Spec Kit template would normally ask for. Run it and
      observe it fail.**
- [x] T013 Implement the exhibition configuration type and the starter exhibition in
      `src/config/exhibition.ts`. This is the only authoring surface in the project
- [x] T014 [P] Write `tests/unit/cameraTarget.test.ts` asserting the viewpoint math produces a
      position in front of the target painting and yields to an already-focused target without
      movement. **Observe it fail.**
- [x] T015 [P] Implement `src/navigation/cameraTarget.ts` as a pure function importing neither React
      nor Three.js
- [x] T016 [P] Write `tests/unit/generateSurface.test.ts` asserting each named finish produces a
      distinct texture at the configured resolution, and that an unrecognised name falls back per
      FR-014 rather than throwing. **Observe it fail.**
- [x] T017 [P] Implement `src/surfaces/generateSurface.ts` using the Canvas 2D API, honouring the
      configured resolution (FR-046) and taking no hard-coded dimensions
- [x] T018 [P] Extend `tests/unit/exhibitionConfig.test.ts` to prove each station has its own wall
      config, the starter wall colours are all different, and duplicate panel colours fail clearly.
      Observe the new assertions fail first.
- [x] T019 Implement per-station wall data and distinct starter colours in
      `src/config/exhibition.ts`; validate colour uniqueness without coupling one station's wall to another.

**Checkpoint**: Foundation ready — configuration, independent station walls, camera math, keyboard navigation math, and surface generation are tested and green. Every later story depends on these.

---

## Phase 3: User Story 1 — View the Exhibition (Priority: P1) 🎯 MVP

**Goal**: The visitor loads the page and sees a row of numbered, framed paintings filling the view.
**Independent Test**: Load the page and confirm a row of at least 24 numbered, framed paintings is
visible without any interaction.

**Requirements**: FR-001 to FR-008, FR-014 to FR-016, FR-024 to FR-026, FR-042 to FR-050,
FR-052 to FR-054; SC-001, SC-007 to SC-009, SC-012, SC-020, SC-021, SC-023

- [X] T020 [P] [US1] Write `tests/component/Artwork.test.tsx` asserting the mounted artwork carries
      its configured number, colour, and frame. **Observe it fail.**
- [X] T021 [P] [US1] Write `tests/component/WallLabel.test.tsx` asserting the 3D text carries the
      configured number, title, artist, and year. **Observe it fail.**
- [X] T022 [P] [US1] Write `tests/component/Exhibition.test.tsx` asserting that changing the
      configured painting count changes the number of mounted artworks, and that breaking the
      rendering to ignore a valid count causes the suite to fail (FR-026). **Observe it fail.**
- [X] T023 [US1] Implement `src/scene/Artwork.tsx` — frame, surface, matte, all driven by config
- [X] T024 [US1] Implement `src/scene/WallLabel.tsx` using drei's 3D text. This is the project's only
      text surface; there is no 2D UI to accompany it
- [X] T025 [US1] Implement `src/scene/Wall.tsx` and `src/scene/Exhibition.tsx`, composing walls and
      artworks from configuration with no values hard-coded
- [X] T026 [US1] Implement `src/scene/CameraRig.tsx` with the overview framing
- [X] T027 [US1] Implement `src/App.tsx` and `src/main.tsx`, wiring the canvas to the exhibition
- [X] T028 [US1] Implement and display the estimated texture-memory figure in `src/scene/MemoryPlaque.tsx` using the calculation from `src/config/textureMemory.ts` (FR-047)
- [x] T029 [P] [US1] Add test-first assertions in `tests/component/Exhibition.test.tsx`, `tests/unit/generateSurface.test.ts`, and `tests/unit/textureMemory.test.ts` for the exact 3D title, arrow instructions, panorama-only sign visibility, generated black-to-grey backdrop, and the backdrop's added texture-memory cost; run them and observe the new assertions fail (FR-047, FR-052, FR-053, FR-054; SC-021, SC-023)
- [x] T030 [US1] Add neon-styled 3D “C1 Art Gallery” text and a 3D arrow-instruction sign to `src/scene/Exhibition.tsx`, and pass overview/focused state from `src/App.tsx` so both signs disappear while an artwork is focused (FR-052, FR-053)
- [x] T031 [US1] Generate the black-to-grey gallery backdrop in `src/surfaces/generateSurface.ts`, mount it behind the works in `src/scene/Exhibition.tsx` over the dark fallback in `src/App.tsx`, update `src/config/textureMemory.ts` to count the backdrop and in-scene sign textures, and document the scene and estimate in `specs/001-exhibition-viewer/quickstart.md` (FR-047, FR-054; SC-021)
- [ ] T032 [US1] Verify `src/App.tsx` and `src/scene/Exhibition.tsx` in the running browser; record that title, arrow instructions, and fade are legible in overview and both signs are hidden when focusing and changing artworks with the arrow keys in `specs/001-exhibition-viewer/research.md` (SC-023)
- [ ] T033 [US1] Verify in the running Codio dev server that the exhibition fills the view at
      several window sizes (FR-049). Measure SC-009 in a client browser, recording its device and
      browser alongside the observed load time in `specs/001-exhibition-viewer/research.md`; revise
      the target in `specs/001-exhibition-viewer/spec.md` if it exceeds 3 seconds

**Checkpoint**: US1 fully functional and independently verifiable. This is the MVP.

---

## Phase 4: User Story 2 — Approach a Painting (Priority: P2)

**Goal**: The visitor clicks a painting and the viewpoint travels to it.
**Independent Test**: Click one painting, verify the viewpoint arrives in front of it, then click
another and confirm the transition.

**Requirements**: FR-007 to FR-013, FR-051; SC-002, SC-010, SC-022

- [x] T034 [P] [US2] Write `tests/component/CameraRig.test.tsx` asserting the rig targets the
      configured position for the painting passed on click, and that a reduced-motion preference
      shortens the duration without removing the transition (FR-013). **Observe it fail.**
- [x] T035 [P] [US2] Write `tests/unit/galleryKeys.test.ts` for left/right adjacent focus, overview
      entry, up-to-overview, and clamped row ends; observe it fail.
- [x] T036 [US2] Implement pure arrow-key navigation in `src/navigation/galleryKeys.ts` and wire it
      to `src/App.tsx`; left/right focus adjacent artworks and up returns to overview.
- [x] T037 [US2] Implement click targeting in `src/scene/CameraRig.tsx` using `cameraTarget.ts` and
      the constitution's permitted easing source
- [x] T038 [US2] Honour the reduced-motion preference in `src/scene/CameraRig.tsx` by scaling duration, keeping the motion
      continuous
- [ ] T039 [US2] Verify `src/scene/CameraRig.tsx` in the running dev server for no transition snap or teleport (SC-010), and
      that a click during an in-flight transition retargets cleanly

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 — Restyle the Exhibition Through Code (Priority: P3)

**Goal**: The student changes a wall colour and a painting colour in the configuration, and the
change appears without any manual build-step edit.
**Independent Test**: Change one wall colour and one painting colour in the configuration, run the
suite, and confirm both changes render.

**Requirements**: FR-003 to FR-006, FR-015, FR-016, FR-021 to FR-027, FR-033, FR-042;
SC-003, SC-005, SC-014

- [x] T040 [P] [US3] Extend `tests/component/Exhibition.test.tsx` to assert each station renders its own configured wall colour and finish; its negative control confirms shared walls fail
      (FR-021): an image wins over a named finish, a named finish wins over a matte default, and an
      image is letterboxed rather than stretched (FR-022). **Observe it fail.**
- [x] T041 [P] [US3] Use `tests/unit/exhibitionConfig.test.ts` to prove errors surface rather than
      a silent fallback (FR-024). **Observe it fail.**
- [x] T042 [US3] Implement the surface precedence in `src/scene/Wall.tsx` and `src/scene/Artwork.tsx`
- [ ] T043 [US3] Confirm a change to `src/config/exhibition.ts` appears in the Codio preview on save, with no manual
      build step (FR-027, FR-033), and record the observed time for SC-009
- [x] T044 [US3] Write `specs/001-exhibition-viewer/quickstart.md` for students, including the
      shared-staging-branch warning from FR-037 and how to request instructor promotion through a
      pull request to `main` after completion

**Checkpoint**: US1, US2, US3 work independently. This is the story that makes the exercise an
exercise — without it there is nothing to teach.

---

## Phase 6: User Story 4 — Replace a Colour With an Image (Priority: P4)

**Goal**: The student configures a painting with an image and it renders, letterboxed.
**Independent Test**: Configure one painting with an image, render, and confirm the image appears
undistorted, then point it at a missing file and confirm the fallback.

**Requirements**: FR-017 to FR-023; SC-006, SC-011

- [x] T045 [P] [US4] Write `tests/component/ArtworkImage.test.tsx` cases for a configured image rendering
      undistorted, an undecodable image falling back to that painting's colour alone, and the rest of
      the exhibition continuing to render (SC-011). **Observe them fail.**
- [x] T046 [US4] Implement image loading and letterbox fitting in `src/scene/Artwork.tsx`
- [x] T047 [US4] Implement per-artwork fallback in `src/scene/Artwork.tsx` so one bad image cannot affect the rest of the scene
- [x] T048 [US4] Add two real image assets under `public/artworks/` so the story is verifiable. Until
      these exist, FR-017 through FR-023 are capability without evidence

**Checkpoint**: US1–US4 work independently.

---

## Phase 7: User Story 5 — Extend the Exhibition (Priority: P5)

**Goal**: The student raises the configured count and the exhibition grows.
**Independent Test**: Increase the configured painting count and confirm the exhibition grows with
correct derived numbering.

**Requirements**: FR-001 to FR-004, FR-046, FR-047; SC-004, SC-021

- [x] T049 [P] [US5] Write `tests/component/Exhibition.test.tsx` cases asserting the derived
      numbering stays contiguous after both an increment and a decrement of the configured count
      (FR-004), and that the reported texture-memory figure tracks the count (FR-047, SC-021).
      **Observe them fail.**
- [x] T050 [US5] Implement count-driven layout in `src/scene/Exhibition.tsx` so the row extends without hard-coded bounds
- [ ] T051 [US5] Verify the extended exhibition from `src/config/exhibition.ts` in the running dev server at the default 512×512
      resolution and record peak browser memory in `specs/001-exhibition-viewer/research.md`
- [ ] T052 [US5] Verify the production build still completes on the Codio sandbox after the count is
      raised in `src/config/exhibition.ts` (FR-043); record exit status and peak RSS in
      `specs/001-exhibition-viewer/research.md` with `/usr/bin/time -v`.

**Checkpoint**: All five user stories independently functional.

---

## Phase 8: Polish & Cross-Cutting

**Requirements**: FR-028 to FR-045, FR-048 to FR-050; SC-007, SC-009, SC-012 to SC-020

- [x] T053 [P] Run the `package.json` lint and typecheck scripts clean across the repository, with no unused exports
      (Principle V)
- [ ] T054 [P] Confirm the full suite from `package.json` completes in under 10 seconds and is not killed for memory on
      the Codio sandbox (SC-007, FR-044); record Node/npm versions, available memory, exit status,
      duration, and peak RSS in `specs/001-exhibition-viewer/research.md`.
- [ ] T055 Verify `vercel.json` deploys the staging branch as a preview and main as production, and that a
      fast-forward from staging to main leaves both serving the same commit (FR-042, SC-019)
- [x] T056 Verify `src/App.tsx` and `src/scene/` expose no visual editing control (SC-012), and that
      all user-facing text in `src/` is English (FR-050)
- [x] T057 [P] Document in `specs/001-exhibition-viewer/quickstart.md` that students request promotion with a pull request from staging to main after completing
      the exercise, as taught in the course lesson. Document the instructor's fast-forward promotion
      procedure: verify the PR's head commit is the accepted commit that passed in staging, and
      re-review if another submission has changed staging. A merge commit breaks the
      staging-equals-production guarantee;
      repository permission configuration and the lesson itself are outside this feature
- [x] T058 Review the repository diff against `.specify/memory/constitution.md`: does it respect the layering,
      is there a test that was seen fail, and would Principle I reject it; record the review in
      `specs/001-exhibition-viewer/research.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (local spikes)**: T001–T002 and T004 are complete with Windows evidence; T003 remains a
  Codio-only measurement and does not block local setup. R1 is renderer observability, R2 is runtime
  compatibility, and R3 is build memory.
- **Phase 1 (setup)**: may use the verified local Node 24.14.1 toolchain and depends on T002 before
  configuring the test runner in T008; Codio runtime and memory validation remain later acceptance
  checks.
- **Phase 2 (foundational)**: depends on Phase 1. Blocks all user stories.
- **Phase 3+ (user stories)**: all depend on Phase 2. US1 must precede the rest, since every other
  story renders through the components it creates.
- **Phase 8 (polish)**: depends on the stories being chosen for delivery.

### User Story Dependencies

- **US1 (P1)**: no story dependencies. Start after Phase 2.
  The overview-presentation test must fail before T030–T031; T032 follows both scene changes.
- **US2 (P2)**: depends on US1's scene components. Uses T015's camera math.
- **US3 (P3)**: depends on US1. The first story that requires a student to edit anything.
- **US4 (P4)**: depends on US1 and the surface precedence built in US3 (T042), since precedence
  decides whether an image or a finish is drawn.
- **US5 (P5)**: depends on US1's layout. Independent of US2 and US4.

### Within Each User Story

- Tests MUST be written and observed failing before the implementation task that satisfies them
- Pure logic (T015, T017) before the components that consume it (T023, T025)
- Components (T023, T024) before composition (T025, T027)
- Browser verification last in every story — it confirms, it does not substitute for the test

### Parallel Opportunities

- T007, T008, T009, T010, T011 are independent of each other
- T012, T014, T016, T018 are independent test tasks
- T015 and T017 are independent of each other
- T020, T021, T022 are independent test tasks
- The new overview-presentation test is independent of the existing US1 tests; the sign and backdrop changes both touch `src/App.tsx` and must run sequentially
- T034 and T035 are independent US2 tests; T040, T041, T045, T049 are separate story tests

---

## Parallel Example: User Story 1

```bash
# Launch the three independent test tasks together:
Task: "Write tests/component/Artwork.test.tsx asserting the mounted artwork carries its configured number, colour, and frame"
Task: "Write tests/component/WallLabel.test.tsx asserting the 3D text carries the configured number, title, artist, and year"
Task: "Write tests/component/Exhibition.test.tsx asserting that changing the configured painting count changes the number of mounted artworks"
Task: "Write tests/unit/exhibitionConfig.test.ts asserting independent, uniquely coloured station walls"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 0 local spikes — confirm the scene-graph assertion and candidate toolchain
2. Phase 1 setup
3. Phase 2 foundational
4. Phase 3 User Story 1
5. **STOP and VALIDATE** — load the page, confirm 24 framed paintings, verify in the browser
6. Deploy to the staging branch

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → push to staging (MVP)
3. US2 → validate → push to staging
4. US3 → validate → push to staging. **This is where the exercise becomes teachable**
5. US4 → validate → push to staging
6. US5 → validate → push to staging
7. Instructor promotes an accepted commit to main with a fast-forward

---

## Notes

- **[P]** means a different file with no dependency on the parallel task
- **[Story]** maps a task to a user story for traceability to the spec
- **Every test task must be observed failing first.** This is constitution Principle II, and the
  review gate checks it per diff
- **Do not substitute a props assertion for a scene-graph assertion** in T022 or T041. That
  substitution is the specific failure mode R1 exists to detect, and it would make FR-026 unfalsifiable
- **Browser verification is a separate step from the suite** in every story. Both are required
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, two parallel tasks editing the same file, and cross-story dependencies that
  break a story's independence
