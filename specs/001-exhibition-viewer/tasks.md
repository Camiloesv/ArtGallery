---

description: "Task list for 001-exhibition-viewer"
---

# Tasks: Exhibition Viewer

**Input**: Design documents from `specs/001-exhibition-viewer/`

**Prerequisites**: plan.md, spec.md
**Not yet produced**: research.md, data-model.md, contracts/ — see Phase 0. `data-model.md` is the
only one with a real dependency; its content is the exhibition configuration type, which T012
implements. If the R1 spike forces a change to how configuration is observed, T012 and everything
downstream must be revisited.

**Tests**: Required. The constitution makes Principle II non-negotiable, so the test tasks below are
not optional. Each MUST be written and observed failing before its implementation task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in every description

---

## Phase 0: Blocking Spikes (do not skip, do not parallelise)

**Purpose**: Resolve the two risks that would invalidate the task list if they fail.

**⚠️ CRITICAL**: No task in any later phase is trustworthy until these two report. The plan's
central technical bet is unverified, and the sandbox may not be able to run the toolchain at all.

- [ ] T001 Verify the Codio sandbox can run the toolchain: report Node version, `free -m`, and
      whether a bare `npm install` completes. Record the result in `specs/001-exhibition-viewer/research.md`.
      **Blocks everything.** Pin the Node version in `.nvmrc` and `package.json` `engines` from this
      result, not from assumption.
- [ ] T002 Spike the test strategy: build a throwaway component that reads a config value and applies
      it to a mesh, and assert with `@react-three/test-renderer` that the value appears in the scene
      graph. Then break the component so it ignores the value and confirm the assertion fails.
      **This is R1.** If the assertion cannot distinguish honoured from ignored, FR-026 is
      unimplementable as written and must be renegotiated before any story task runs. Do not
      substitute an assertion on props — that is the exact thing FR-026 exists to prevent.
- [ ] T003 Measure the production build's peak memory on the sandbox (FR-043). Run the build under
      `/usr/bin/time -v` and record peak RSS. If it is killed or exceeds the free budget, determine
      which mitigation applies: an `NODE_OPTIONS` ceiling tuned down, esbuild minification, or
      fewer dev dependencies. **This is R2.**
- [ ] T004 Write `specs/001-exhibition-viewer/research.md` with the T001–T003 results, the npm
      version compatibility matrix, and the measured load time for SC-009. Record the observed SC-009
      figure in the spec if it differs from 3 seconds.

**Checkpoint**: R1 confirmed working and the build fits the sandbox. If either failed, stop and
renegotiate the spec before continuing.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialisation and structure

- [ ] T005 Create the directory layout from plan.md: `src/{config,navigation,surfaces,scene}`,
      `tests/{unit,component}`, `index.html`
- [ ] T006 Initialise the project and install the runtime dependencies pinned in plan.md
      (`react`, `@react-three/fiber`, `@react-three/drei`, `maath`) and the dev-only set
      (`@react-three/test-renderer`, `vitest`, `typescript`)
- [ ] T007 [P] Configure ESLint and Prettier, enforcing the constitution's rules: no unused exports,
      no dead code, no bare `any`, and no import from `src/scene` into `src/config`,
      `src/navigation`, or `src/surfaces`
- [ ] T008 [P] Configure Vitest with `@react-three/test-renderer`, with a setup file that supplies no
      WebGL context. Confirm the suite runs on the sandbox within the T001 budget
- [ ] T009 [P] Add `.nvmrc` and a POSIX-shell setup script for students. The constitution makes
      Windows-only tooling unacceptable, so the script must not assume PowerShell
- [ ] T010 [P] Configure the Vercel deployment so the `staging` branch becomes a preview and `main`
      becomes production (FR-039). Confirm a push to each branch produces the expected target
- [ ] T011 [P] Configure the dev server to start and serve on the sandbox (FR-045) and record the
      observed start time

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The configuration type and the pure logic every story depends on.

**⚠️ CRITICAL**: No user story can begin until this phase is complete.

- [ ] T012 Write `tests/unit/exhibitionConfig.test.ts` asserting the exhibition configuration type
      rejects an unknown finish name, a non-positive count, and a duplicate position, and accepts
      the starter exhibition. **Run it and observe it fail.**
- [ ] T013 Implement the exhibition configuration type and the starter exhibition in
      `src/config/exhibition.ts`. This is the only authoring surface in the project
- [ ] T014 [P] Write `tests/unit/cameraTarget.test.ts` asserting the viewpoint math produces a
      position in front of the target painting and yields to an already-focused target without
      movement. **Observe it fail.**
- [ ] T015 [P] Implement `src/navigation/cameraTarget.ts` as a pure function importing neither React
      nor Three.js
- [ ] T016 [P] Write `tests/unit/generateSurface.test.ts` asserting each named finish produces a
      distinct texture at the configured resolution, and that an unrecognised name falls back per
      FR-014 rather than throwing. **Observe it fail.**
- [ ] T017 [P] Implement `src/surfaces/generateSurface.ts` using the Canvas 2D API, honouring the
      configured resolution (FR-046) and taking no hard-coded dimensions

**Checkpoint**: Foundation ready — configuration, camera math, and surface generation are all
tested and green. Every later story depends on these three.

---

## Phase 3: User Story 1 — View the Exhibition (Priority: P1) 🎯 MVP

**Goal**: The visitor loads the page and sees a row of numbered, framed paintings filling the view.
**Independent Test**: Load the page and confirm a row of at least 24 numbered, framed paintings is
visible without any interaction.

**Requirements**: FR-001 to FR-006, FR-042 to FR-045, FR-048, FR-049, FR-050

- [ ] T018 [P] [US1] Write `tests/component/Artwork.test.tsx` asserting the mounted artwork carries
      its configured number, colour, and frame. **Observe it fail.**
- [ ] T019 [P] [US1] Write `tests/component/WallLabel.test.tsx` asserting the 3D text carries the
      configured number, title, artist, and year. **Observe it fail.**
- [ ] T020 [P] [US1] Write `tests/component/Exhibition.test.tsx` asserting that changing the
      configured painting count changes the number of mounted artworks, and that breaking the
      rendering to ignore a valid count causes the suite to fail (FR-026). **Observe it fail.**
- [ ] T021 [US1] Implement `src/scene/Artwork.tsx` — frame, surface, matte, all driven by config
- [ ] T022 [US1] Implement `src/scene/WallLabel.tsx` using drei's 3D text. This is the project's only
      text surface; there is no 2D UI to accompany it
- [ ] T023 [US1] Implement `src/scene/Wall.tsx` and `src/scene/Exhibition.tsx`, composing walls and
      artworks from configuration with no values hard-coded
- [ ] T024 [US1] Implement `src/scene/CameraRig.tsx` with the overview framing
- [ ] T025 [US1] Implement `src/App.tsx` and `src/main.tsx`, wiring the canvas to the exhibition
- [ ] T026 [US1] Implement the reported texture-memory figure (FR-047) from the configured count and
      resolution
- [ ] T027 [US1] Verify in the running Codio dev server that the exhibition fills the view at
      several window sizes (FR-049), and record the observed load time for SC-009

**Checkpoint**: US1 fully functional and independently verifiable. This is the MVP.

---

## Phase 4: User Story 2 — Approach a Painting (Priority: P2)

**Goal**: The visitor clicks a painting and the viewpoint travels to it.
**Independent Test**: Click one painting, verify the viewpoint arrives in front of it, then click
another and confirm the transition.

**Requirements**: FR-007, FR-009, FR-010, FR-011, FR-013

- [ ] T028 [P] [US2] Write `tests/component/CameraRig.test.tsx` asserting the rig targets the
      configured position for the painting passed on click, and that a reduced-motion preference
      shortens the duration without removing the transition (FR-013). **Observe it fail.**
- [ ] T029 [US2] Implement click targeting in `src/scene/CameraRig.tsx` using `cameraTarget.ts` and
      the constitution's permitted easing source
- [ ] T030 [US2] Honour the reduced-motion preference by scaling duration, keeping the motion
      continuous
- [ ] T031 [US2] Verify in the running dev server that no transition snaps or teleports (SC-010), and
      that a click during an in-flight transition retargets cleanly

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 — Restyle the Exhibition Through Code (Priority: P3)

**Goal**: The student changes a wall colour and a painting colour in the configuration, and the
change appears without any manual build-step edit.
**Independent Test**: Change one wall colour and one painting colour in the configuration, run the
suite, and confirm both changes render.

**Requirements**: FR-005, FR-006, FR-021 to FR-024, FR-027, FR-033, FR-042

- [ ] T032 [P] [US3] Write `tests/component/Wall.test.tsx` asserting the surface precedence rule
      (FR-021): an image wins over a named finish, a named finish wins over a matte default, and an
      image is letterboxed rather than stretched (FR-022). **Observe it fail.**
- [ ] T033 [P] [US3] Write a test asserting a configuration error surfaces as a failure rather than
      a silent fallback (FR-024). **Observe it fail.**
- [ ] T034 [US3] Implement the surface precedence in `src/scene/Wall.tsx` and `src/scene/Artwork.tsx`
- [ ] T035 [US3] Confirm the Codio preview reflects a configuration change on save, with no manual
      build step (FR-027, FR-033), and record the observed time for SC-009
- [ ] T036 [US3] Write `specs/001-exhibition-viewer/quickstart.md` for students, including the
      shared-staging-branch warning from FR-037: a submission can be replaced by another student's
      push, and that is expected rather than a bug

**Checkpoint**: US1, US2, US3 work independently. This is the story that makes the exercise an
exercise — without it there is nothing to teach.

---

## Phase 6: User Story 4 — Replace a Colour With an Image (Priority: P4)

**Goal**: The student configures a painting with an image and it renders, letterboxed.
**Independent Test**: Configure one painting with an image, render, and confirm the image appears
undistorted, then point it at a missing file and confirm the fallback.

**Requirements**: FR-017 to FR-023

- [ ] T037 [P] [US4] Write `tests/component/Artwork.test.tsx` cases for a configured image rendering
      undistorted, an undecodable image falling back to that painting's colour alone, and the rest of
      the exhibition continuing to render (SC-011). **Observe them fail.**
- [ ] T038 [US4] Implement image loading and letterbox fitting in `src/scene/Artwork.tsx`
- [ ] T039 [US4] Implement per-artwork fallback so one bad image cannot affect the rest of the scene
- [ ] T040 [US4] Add two real image assets under `public/artworks/` so the story is verifiable. Until
      these exist, FR-017 through FR-023 are capability without evidence

**Checkpoint**: US1–US4 work independently.

---

## Phase 7: User Story 5 — Extend the Exhibition (Priority: P5)

**Goal**: The student raises the configured count and the exhibition grows.
**Independent Test**: Increase the configured painting count and confirm the exhibition grows with
correct derived numbering.

**Requirements**: FR-001 to FR-004, FR-046, FR-047

- [ ] T041 [P] [US5] Write `tests/component/Exhibition.test.tsx` cases asserting the derived
      numbering stays contiguous after both an increment and a decrement of the configured count
      (FR-004), and that the reported texture-memory figure tracks the count (FR-047, SC-021).
      **Observe them fail.**
- [ ] T042 [US5] Implement count-driven layout so the row extends without hard-coded bounds
- [ ] T043 [US5] Verify the extended exhibition in the running dev server at the default 512×512
      resolution and record peak browser memory
- [ ] T044 [US5] Verify the production build still completes on the sandbox after the count is raised
      (FR-043)

**Checkpoint**: All five user stories independently functional.

---

## Phase 8: Polish & Cross-Cutting

- [ ] T045 [P] Run lint and typecheck clean across the repository, with no unused exports
      (Principle V)
- [ ] T046 [P] Confirm the full suite runs to completion on the sandbox without being killed for
      memory (FR-044), and record peak RSS
- [ ] T047 Verify the staging branch deploys a preview and main deploys production, and that a
      fast-forward from staging to main leaves both serving the same commit (FR-042, SC-019)
- [ ] T048 Verify no visual editing control exists anywhere in the interface (SC-012), and that all
      user-facing text is English (FR-050)
- [ ] T049 [P] Document the promotion procedure for the instructor, including the fast-forward
      requirement and the fact that a merge commit breaks the staging-equals-production guarantee
- [ ] T050 Review every diff against the constitution's three questions: does it respect the layering,
      is there a test that was seen fail, and would Principle I reject it

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (spikes)**: no dependencies, but blocks everything. R1 and R2 are sequential within it —
  if T002 needs Vitest running on the sandbox, T001 must have completed first.
- **Phase 1 (setup)**: depends on T001 for the Node version, and on T002 before configuring the test
  runner in T008
- **Phase 2 (foundational)**: depends on Phase 1. Blocks all user stories.
- **Phase 3+ (user stories)**: all depend on Phase 2. US1 must precede the rest, since every other
  story renders through the components it creates.
- **Phase 8 (polish)**: depends on the stories being chosen for delivery.

### User Story Dependencies

- **US1 (P1)**: no story dependencies. Start after Phase 2.
- **US2 (P2)**: depends on US1's scene components. Uses T015's camera math.
- **US3 (P3)**: depends on US1. The first story that requires a student to edit anything.
- **US4 (P4)**: depends on US1 and the surface precedence built in US3 (T034), since precedence
  decides whether an image or a finish is drawn.
- **US5 (P5)**: depends on US1's layout. Independent of US2 and US4.

### Within Each User Story

- Tests MUST be written and observed failing before the implementation task that satisfies them
- Pure logic (T015, T017) before the components that consume it (T021, T023)
- Components (T021, T022) before composition (T023, T025)
- Browser verification last in every story — it confirms, it does not substitute for the test

### Parallel Opportunities

- T007, T008, T009, T010, T011 are independent of each other
- T012, T014, T016 are independent test tasks
- T015 and T017 are independent of each other
- T018, T019, T020 are independent test tasks
- T028, T032, T033, T037, T041 are independent test tasks

---

## Parallel Example: User Story 1

```bash
# Launch the three independent test tasks together:
Task: "Write tests/component/Artwork.test.tsx asserting the mounted artwork carries its configured number, colour, and frame"
Task: "Write tests/component/WallLabel.test.tsx asserting the 3D text carries the configured number, title, artist, and year"
Task: "Write tests/component/Exhibition.test.tsx asserting that changing the configured painting count changes the number of mounted artworks"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 0 spikes — confirm R1 and R2 before building anything
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
- **Do not substitute a props assertion for a scene-graph assertion** in T020 or T033. That
  substitution is the specific failure mode R1 exists to detect, and it would make FR-026 unfalsifiable
- **Browser verification is a separate step from the suite** in every story. Both are required
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, two parallel tasks editing the same file, and cross-story dependencies that
  break a story's independence
