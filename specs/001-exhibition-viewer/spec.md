# Feature Specification: Exhibition Viewer

**Feature Branch**: `001-exhibition-viewer` (no branch created — repository is not yet under version control)

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "A 3D art gallery that teaches students by letting them restyle the exhibition — walls, wall finishes, and paintings — by editing code, verifying with tests, and shipping to production. No visual editor: the code is the interface."

## Clarifications

### Session 2026-09-30

- Q: Should the test suite verify that rendering honours the configuration, or only that the configuration is valid? → A: Component tests that mount the components and assert the rendered result carries the configured values.
- Q: Where is a focused painting's title, artist, and year presented to the visitor? → B: Rendered as text on the wall panel itself, beside the number, so the project contains no 2D user interface at all.
- Q: If a wall declares both a named finish and an image, which one is drawn? → A: The image wins and the named finish acts as the fallback, giving a two-level precedence rule.
- Q: How does the viewpoint behave when the visitor prefers reduced motion? → B: The transition still runs and remains continuous, but completes in a small fraction of the normal duration. No exemption to FR-011 is needed.
- Q: Is shipping to production part of this feature, and what differs between development, staging, and production? → A: Yes, the feature ships through a dev → staging → production chain, and all three run identical configuration and identical content. Staging is an exact preview of production, and the configuration file contains no environment-conditional values.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the Exhibition (Priority: P1)

A visitor opens the gallery and sees a long wall holding a numbered row of framed paintings. Each
painting sits on its own panel, and each panel shows a large number identifying the piece. The
visitor can take in the whole exhibition at once and understand that it is a sequence of
individual, independently editable works.

**Why this priority**: Without a visible exhibition there is nothing to teach against. This is the
baseline that every other story modifies.

**Independent Test**: Load the page and confirm a row of at least 24 numbered, framed paintings is
visible without any interaction.

**Acceptance Scenarios**:

1. **Given** a fresh page load, **When** the exhibition renders, **Then** a row of at least 24
   framed paintings is visible, each on its own panel.
2. **Given** the exhibition is rendered, **When** the visitor looks at any panel, **Then** that
   panel displays the number of the piece it holds.
3. **Given** the exhibition is rendered, **When** the visitor looks at the scene, **Then** a ground
   plane and even lighting are present so the paintings read as a gallery rather than floating
   objects.

---

### User Story 2 - Approach a Painting (Priority: P2)

A visitor clicks a painting in the exhibition. The viewpoint glides smoothly from the wide
overview to a position directly in front of that painting, where the artwork and the wall around
it fill the view. Clicking away from the paintings returns the viewpoint to the wide overview.

**Why this priority**: Focus is what turns a static row into a browsable exhibition, and it is the
only interaction the visitor gets. It also makes each restyled wall legible.

**Independent Test**: Click one painting, verify the viewpoint arrives in front of it, then click
empty space and verify the viewpoint returns to the overview.

**Acceptance Scenarios**:

1. **Given** the overview is displayed, **When** the visitor clicks a painting, **Then** the
   viewpoint moves to a position directly in front of that painting.
2. **Given** a painting is in focus, **When** the visitor clicks outside any painting, **Then** the
   viewpoint returns to the wide overview of the whole exhibition.
3. **Given** a painting is in focus, **When** the transition runs, **Then** it is continuous and
   smooth, with no visible jump or snap.
4. **Given** a painting is in focus, **When** the visitor clicks a different painting, **Then** the
   viewpoint moves to that painting instead.

---

### User Story 3 - Restyle the Exhibition Through Code (Priority: P3)

A student changes the exhibition by editing its configuration: they recolor a wall, give a panel a
different surface finish, change a painting's colour, or change a title and artist. Running the
project shows the change immediately. The student verifies the change with automated tests before
shipping it.

**Why this priority**: This is the pedagogical core. The gallery is the deliverable, but the
exercise is that configuration is the only place restyling happens, and that the change is
provable by a test.

**Independent Test**: Change one wall colour and one painting colour in the configuration, run the
test suite, and confirm the rendered exhibition matches.

**Acceptance Scenarios**:

1. **Given** a wall is configured with a colour, **When** the exhibition renders, **Then** that
   wall's panel is painted in the configured colour.
2. **Given** a wall is configured with a surface finish, **When** the exhibition renders, **Then**
   the panel's surface visibly differs from a plain matte finish.
3. **Given** a painting is configured with a colour, **When** the exhibition renders, **Then** the
   painting's surface uses that colour.
4. **Given** a painting is configured with a title, artist, and year, **When** its wall panel is
   viewed, **Then** the number, title, artist, and year are all legible on that panel.
5. **Given** a student has restyled the exhibition, **When** they run the test suite, **Then** the
   tests confirm the configuration is valid and matches what is rendered.

---

### User Story 4 - Replace a Colour With an Image (Priority: P4)

A student is able to point a painting at an image file instead of a flat colour, and the painting
displays that image in its frame. The same works for a wall: a student can supply an image
instead of relying on a generated surface.

**Why this priority**: The gallery must be able to show real artwork eventually, and the student
must be able to get there by changing configuration, not by rewriting the rendering.

**Independent Test**: Configure one painting with an image, render, and confirm the image appears
inside the frame at the correct proportions.

**Acceptance Scenarios**:

1. **Given** a painting is configured with an image, **When** the exhibition renders, **Then** the
   image is displayed on the painting's surface instead of a flat colour.
2. **Given** a painting is configured with an image, **When** it renders, **Then** the image fits
   within the frame without distortion.
3. **Given** a painting is configured with an image that cannot be loaded, **When** it renders,
   **Then** the painting falls back to its configured colour and the exhibition remains usable.
4. **Given** a wall is configured with an image, **When** the exhibition renders, **Then** the image
   is displayed across the wall panel.

---

### User Story 5 - Extend the Exhibition (Priority: P5)

A student changes the number of paintings, their spacing, or the layout, purely through
configuration. They can also add a new named wall finish that the existing surfaces can use. No
rendering logic is edited to add a piece or a finish.

**Why this priority**: Demonstrates that the design is genuinely open to extension, which is the
architectural lesson, and lets students scale the exercise up.

**Independent Test**: Increase the configured painting count and confirm the exhibition grows
accordingly with no rendering changes.

**Acceptance Scenarios**:

1. **Given** the configured painting count is increased, **When** the exhibition renders, **Then**
   the additional paintings appear, evenly spaced and numbered in sequence.
2. **Given** the configured painting count is decreased, **When** the exhibition renders, **Then**
   the exhibition shows only the configured number, with no gaps in numbering.
3. **Given** a new wall finish is added to configuration, **When** a wall selects that finish,
   **Then** the wall renders with the new finish's appearance.
4. **Given** the configured spacing is changed, **When** the exhibition renders, **Then** the
   spacing between paintings changes accordingly.

---

### Edge Cases

- The visitor clicks repeatedly while a viewpoint transition is still running: the transition
  retargets to the most recent selection rather than queueing or freezing.
- The visitor clicks the painting that is already in focus: the viewpoint stays where it is.
- A painting count of one, or a very large count: the exhibition remains navigable and the
  numbering stays correct.
- A configured position places two paintings at the same spot: the rendering remains stable and
  does not produce an unusable view.
- A configured image is missing, empty, or in a format the browser cannot decode: that painting
  falls back to its colour and the rest of the exhibition is unaffected.
- A wall finish is configured that no generator recognises: the wall falls back to a plain matte
  surface rather than failing to render.
- A configuration omits an optional field such as artist or year: the exhibition renders and
  presents the piece without that detail rather than failing.
- The browser window is very narrow or very wide: the exhibition fills the view and remains fully
  visible.
- The visitor prefers reduced motion: the viewpoint transition still runs and is still continuous,
  but completes in a small fraction of the normal duration.

## Requirements *(mandatory)*

### Functional Requirements

**Exhibition content**

- **FR-001**: The system MUST render an ordered row of at least 24 individually framed paintings,
  each mounted on its own wall panel, with a ground plane and lighting.
- **FR-002**: Each painting MUST display its position number in the exhibition as a visible label
  on its wall panel.
- **FR-003**: The exhibition content MUST be defined entirely by a single configuration source that
  students can edit without touching any rendering logic.
- **FR-004**: The system MUST derive painting numbers, positions, and spacing from the
  configuration, so that changing the configured count produces a correct, evenly spaced, contiguously
  numbered exhibition.

**Per-piece data**

- **FR-005**: Each painting MUST be able to carry a title, an artist, a year, and a position
  number.
- **FR-006**: Each wall panel MUST be able to carry a colour, a surface roughness value, and a named
  surface finish.
- **FR-007**: Each painting's number, title, artist, and year MUST all be presented on its wall
  panel, as text belonging to the 3D scene. The exhibition MUST contain no 2D user interface of any
  kind, so descriptive information and labels live only inside the scene.
- **FR-008**: The system MUST render successfully when optional descriptive fields are absent.

**Viewpoint navigation**

- **FR-009**: When the visitor clicks a painting, the viewpoint MUST move to a position directly in
  front of that painting.
- **FR-010**: When the visitor clicks outside all paintings, the viewpoint MUST return to a wide
  overview that shows the whole exhibition.
- **FR-011**: All viewpoint transitions MUST be continuous and smooth, with no visible snap.
- **FR-012**: A new selection made during an in-progress transition MUST retarget the transition to
  the new selection.
- **FR-013**: The system MUST honour a reduced-motion preference by shortening the viewpoint
  transition to a small fraction of its normal duration. The transition MUST still run and MUST
  remain continuous — reduced motion shortens the movement, it does not replace it with a jump.

**Wall surfaces**

- **FR-014**: A wall panel MUST support at least four named finishes: a plain matte plaster, a
  fine-grained concrete, a coarser limewash, and a dark matte slate.
- **FR-015**: Two wall panels configured with different finishes MUST be visually distinguishable
  from each other.
- **FR-016**: A wall configured with an unrecognised finish name MUST render as a plain matte
  surface.

**Painting surfaces**

- **FR-017**: Each painting MUST be able to display either a flat configured colour or an image
  supplied by configuration.
- **FR-018**: An image displayed on a painting MUST fit inside its frame without visible
  distortion.
- **FR-019**: A painting whose image cannot be loaded MUST display its configured colour instead,
  and MUST NOT prevent the rest of the exhibition from rendering.
- **FR-020**: A wall panel MUST be able to display an image supplied by configuration in place of
  its generated surface.
- **FR-021**: A wall or painting that declares both a named surface finish and an image MUST
  display the image. The named finish applies only when no image is present, so the precedence
  rule is: image if present, otherwise the named finish, otherwise plain matte.
- **FR-022**: An image MUST be scaled to fit inside its surface without visible distortion. If the
  image's proportions differ from the surface, the image MUST be letterboxed so the full image
  remains visible rather than cropped.
- **FR-023**: The image-fit behaviour MUST apply identically to painting surfaces and wall
  surfaces, so a single rule governs every image in the exhibition.

**Verifiability (the pedagogical requirement)**

- **FR-024**: The system MUST provide automated tests that mount the rendering components and
  assert that the rendered result carries the values declared in the exhibition configuration,
  without requiring a real browser.
- **FR-025**: Those tests MUST cover the chain from configuration to rendered output — wall colour,
  wall finish, painting colour, painting image, and derived numbering and spacing.
- **FR-026**: Those tests MUST fail both when a student introduces a configuration error and when
  the rendering stops honouring a valid configuration. A passing suite is therefore evidence that
  the change is sound end to end, not merely well-formed.
- **FR-027**: Running the project locally MUST reflect configuration changes without any manual
  build-step edit.

**Environment chain (development → staging → production)**

- **FR-028**: The exercise MUST progress through a development environment, a staging environment,
  and a production environment, in that order.
- **FR-029**: All three environments MUST be served from the same exhibition configuration file.
  The configuration MUST NOT contain values that vary by environment.
- **FR-030**: Staging MUST be an exact preview of production: identical content, identical
  configuration, and identical build output.
- **FR-031**: A production release MUST be possible only from a commit that already passed in
  staging, so a passing staging run is the evidence for the production release.
- **FR-032**: The production build MUST be reproducible from the same source and configuration that
  staging served, with no manual step between the two.

**Presentation constraints**

- **FR-033**: The system MUST NOT provide any visual interface for editing the exhibition. The
  configuration file is the only authoring surface.
- **FR-034**: The rendered exhibition MUST fill the available view at any window size.
- **FR-035**: All user-facing text MUST be in English.

### Key Entities

- **Exhibition**: The whole gallery. Holds an ordered collection of stations, plus layout values
  that determine their count and spacing.
- **Station**: One painting plus the wall panel it hangs on. Carries a number, a title, an artist, a
  year, a position, a wall definition, and a painting definition.
- **Wall**: The surface behind a painting. Carries a colour, a roughness value, a named finish, and
  an optional image.
- **Painting**: The framed surface in front of a wall. Carries a colour and an optional image.
- **Surface Finish**: A named wall appearance that the rendering can produce. Carries a label and
  the properties that distinguish its appearance.
- **Viewpoint State**: Which station, if any, the visitor is currently focused on, or the overview.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor who has never seen the gallery can identify that it contains 24 separate,
  individually numbered works within 15 seconds of the page finishing loading.
- **SC-002**: A visitor can reach any specific painting by clicking it, in a single interaction,
  without any on-screen control panel or menu.
- **SC-003**: A student can change a wall colour, a wall finish, and a painting colour, then see the
  result on screen, by editing configuration only — with no rendering file touched.
- **SC-004**: A student can increase the number of paintings in the exhibition and see the correct
  new count, with correct contiguous numbering and even spacing, by editing configuration only.
- **SC-005**: A student can add a brand new wall finish and apply it to a wall, without editing any
  rendering logic.
- **SC-006**: A student can point a painting at an image file and see that image inside the frame,
  by editing configuration only.
- **SC-007**: An automated test suite runs in under 10 seconds, mounts the rendering components
  headlessly, and fails if the rendered result disagrees with the exhibition configuration.
- **SC-008**: A deliberately broken configuration causes the test suite to fail, fixing it causes
  the suite to pass again, and deliberately breaking the rendering so it ignores a valid
  configuration also causes the suite to fail.
- **SC-009**: The exhibition becomes interactive and fully navigable within 3 seconds of the page
  finishing loading on a typical student laptop.
- **SC-010**: Viewpoint transitions contain no visible snapping or teleport; the viewpoint moves
  continuously from overview to any painting.
- **SC-011**: A missing or undecodable image causes at most that one painting to fall back to its
  colour; the rest of the exhibition continues to render and navigate normally.
- **SC-012**: No on-screen control for editing the exhibition exists anywhere in the interface.
- **SC-013**: The exhibition rendered in staging is visually and behaviourally indistinguishable
  from the one in production, with no content or configuration difference between them.
- **SC-014**: A student can promote a change from development to staging to production in a single
  automated step per environment, with no manual editing of configuration at any transition.
- **SC-015**: The production deployment can be traced back to the exact commit that passed in
  staging.

## Assumptions

- The project is a brand-new repository; there is no existing system to integrate with or migrate
  from.
- Changes are authored by editing files locally, verified by running the test suite, promoted to
  staging, and then released to production. All three environments read the same configuration file,
  so the configuration is the single source of truth and holds no environment-conditional values.
- Staging exists to prove a change, not to host different content. Because staging and production
  are identical, a green staging run is the evidence for the production release.
- The exhibition ships with flat colours as placeholder content. Real imagery is a student exercise,
  so the repository carries no binary image assets at launch.
- A single exhibition is in scope. Multiple exhibitions, exhibitions loaded at runtime, or
  user-selectable collections are out of scope.
- Textures are generated in the browser rather than shipped as image files, so that no binary assets
  are required and the generation logic is itself a teaching surface.
- The audience is students on modern desktop browsers capable of hardware-accelerated 3D rendering.
  Mobile and tablet layout is not optimised, though the exhibition must remain visible at any window
  size.
- Third-party runtime dependencies are limited to the stack already fixed in the project
  constitution, and each is used for exactly one role.
- The 24-piece count is a starting default, not a fixed limit; the count lives in configuration.

## Out of Scope

The following are explicitly not part of this feature. Each is listed so that its absence is a
decision rather than an omission.

- **Any visual editing interface.** The configuration file is the only authoring surface. Adding a
  panel, drawer, or in-scene manipulator would defeat the purpose of the exercise.
- **Environment-conditional content.** Staging and production serve identical exhibitions, so there
  is no reduced smoke-test exhibition and no per-environment configuration.
- **Multiple exhibitions, exhibition switching, or runtime-loaded collections.** One exhibition at
  a time.
- **Accounts, authentication, and per-student persistence.** Student work lives in their own clone
  and their own commits.
- **Sharing or collaboration between students.** Merging two students' restyled walls is out of
  scope.
- **Server-side rendering, a backend, or a database.** The exhibition is a client-side experience.
- **A gallery management admin panel.** The same constraint as the editing interface, applied to
  exhibition lifecycle operations.
- **Audio, video, and non-image media in artworks.** Images only.
- **Optimised mobile and tablet layout.** The exhibition must remain visible at any window size, but
  touch-first layout is not a goal.
- **Analytics, telemetry, and usage tracking.**
