# ArtGallery Constitution

## Core Principles

### I. Simplicity and YAGNI (NON-NEGOTIABLE)

- A runtime dependency MUST NOT be added unless it removes more code than it introduces, or is
  already part of the chosen stack (React, Vite, Three.js, `@react-three/fiber`, drei, maath,
  Tailwind CSS).
- State management MUST use React built-ins (`useState`, `useReducer`, `useContext`) until a
  concrete requirement for an external store exists.
- No abstraction, design pattern, or generic utility MUST be created for a single call site.
- Any speculative extension point MUST carry a comment naming the trigger that would justify it.
- Rationale: this artifact is a teaching vehicle. Incidental complexity is a direct cost to the
  students who must read and modify it.

### II. Test-First (NON-NEGOTIABLE)

- Every behavior MUST be preceded by a test that encodes the requirement, and that test MUST be
  observed failing before implementation begins.
- A feature is not complete until the new test passes and the suite is refactored while still
  green.
- Pure logic — station configuration, wall presets, texture generation parameters, camera
  targeting math — MUST be testable without a WebGL context.
- Scene components are exempt from unit tests, but any change to them MUST be verified in a
  running browser.
- No test may be deleted, skipped, or weakened to make a suite pass.
- Rationale: the test suite is the primary artifact students read as a specification, so the
  discipline has to be visible in the repository.

### III. SOLID and Layered Boundaries

- **SRP** — One file, one responsibility. A texture generator MUST NOT contain mesh code; a scene
  component MUST NOT generate canvas textures; a UI component MUST NOT own exhibition state.
- **OCP** — Adding a wall finish, a preset, or a station MUST be a configuration change, never a
  modification of render loops or material setup.
- **LSP** — Any object satisfying a documented material or texture contract MUST be swappable
  without changes at the call site.
- **ISP** — A component MUST receive only the props it uses. Passing whole-application state as a
  single prop is a violation.
- **DIP** — High-level orchestrators (`App`, `GalleryCanvas`) MUST depend on plain serializable
  data, not on concrete procedural logic.
- Import direction is one-way: `components/` and `App` MAY import `services/` and `constants/`;
  those two MUST NOT import from `components/`. Reverse imports are violations.
- Rationale: students are taught SOLID; the repository has to be a working demonstration of it,
  not a place where the rule is bent.

### IV. Configuration Over Code

- Exhibition data — station ids, titles, artists, years, positions, wall properties — MUST live in
  a configuration module as plain serializable objects.
- Adding a station, a preset, or a finish MUST NOT require editing component JSX.
- A new wall finish MUST be implementable as a new function in the texture service with existing
  call sites left untouched.
- The configuration schema MUST be documented in the same file that declares it.
- Rationale: an exercise must be forkable with a data edit, not a refactor.

### V. Pedagogical Transparency

- The code is the lesson. Prefer the direct, readable construction over the clever one, even when
  a shorter alternative exists.
- Non-obvious values — camera damping constants, noise factors, layout spacing, station pitch —
  MUST carry a comment stating the intent, not restating the number.
- Naming MUST use exhibition domain terms (station, wall, artwork, frame), not implementation
  jargon.
- Dead code, commented-out blocks, and unused exports MUST NOT be committed. Unused code is
  removed, not parked.
- Every exercise variant MUST be reachable from the interface without editing source files.
- Rationale: students read, modify, and present this code. Clarity is a functional requirement,
  not a style preference.

## Technology Constraints

- Build tool MUST be Vite. No server-side rendering framework; this is a client-side WebGL
  experience and SSR would impose constraints without benefit.
- Rendering MUST go through `@react-three/fiber` on top of Three.js. Imperative scene mutation
  from outside the React lifecycle is not permitted.
- drei MAY be used for camera controls, text, and asset loading. maath or `THREE.MathUtils` is the
  only permitted source of easing and damping math.
- Visual surfaces MUST be generated procedurally with the Canvas 2D API or loaded from project
  files. No runtime dependency on third-party asset services.
- Styling MUST use Tailwind CSS or standard modular CSS. Inline style objects are limited to
  data-driven values such as positions, colors, and dimensions.
- All user-facing strings, identifiers, comments, and documentation MUST be in English.
- A new runtime dependency MUST be justified in the change description against Principle I.

## Development Workflow

1. Specification first. A feature MUST have an approved spec (`/speckit.specify`) and plan
   (`/speckit.plan`) before code is written.
2. Write the failing test and observe it fail.
3. Implement the minimum that passes.
4. Refactor with the suite green and lint clean.
5. Verify in the browser. Any change touching a scene component MUST be confirmed in the running
   dev server, not only by unit tests.
6. Lint and typecheck MUST pass before a change counts as done.
7. Scope discipline. A task implements the current task only; unrelated improvements are deferred
   rather than smuggled in.

## Governance

This constitution supersedes any conflicting convention, personal preference, or generated
suggestion about how to structure or write code in this repository. Where a tutorial, a helper, or
an existing file disagrees with a principle here, the principle wins and the disagreement is
corrected rather than followed.

- Compliance MUST be verified before a change is merged. The review answers three questions: does
  the diff respect the layering, is there a test that was seen fail, and does the change contain
  anything Principle I would reject?
- Complexity that violates a principle MUST be justified explicitly in the change description or
  removed.
- Amendments MUST go through `/speckit.constitution` with a stated reason and a version bump.
  Removing or redefining a principle is MAJOR, new or materially expanded guidance is MINOR, and
  clarifications or wording fixes are PATCH.
- Runtime development guidance belongs in `AGENTS.md`, which is subordinate to this document.
- When a principle and a deadline conflict, the principle holds and scope is cut instead.

**Version**: 1.0.0 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-09-30
