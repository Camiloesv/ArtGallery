# Specification Quality Checklist: Exhibition Viewer

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-30
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed
- [x] Out-of-scope items are declared explicitly

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified
- [x] No requirement contradicts another

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification
- [x] Ambiguous precedence between competing rules is resolved

## Notes

### Validation pass 1 — issues found and resolved

1. **"Technology-agnostic" failed on first draft.** The spec's framing mirrored the user's input
   and named frameworks, texture APIs, and easing utilities. Rewritten: all stack references removed
   and replaced with capability language ("surface finish", "generated in the browser rather than
   shipped as image files"). The stack itself is already fixed in the constitution, so restating it
   in the spec added nothing but coupling.

2. **Scope ambiguity: a visual editor panel.** The user's initial description included a curator
   drawer for editing walls. This directly contradicts the stated pedagogical goal of
   code-driven change, verified with the tests. Resolved by removing the editor entirely and adding
   **FR-025** plus **SC-012**, which make "no editing interface" an explicit, testable requirement
   rather than an omission. This is the single most important decision in this spec.

3. **Scope ambiguity: how the visitor navigates.** Unanswerable from the input once the editor was
   removed. Resolved with the user: click the painting directly in the scene. Captured in
   **FR-009**, **FR-010**, and **SC-002**.

4. **Untestable requirement FR-024.** Originally read "changes apply without restarting." Rewritten
   to state the observable outcome: the running project reflects configuration changes with no
   manual build-step edit.

5. **Missing edge cases.** Added: click during in-flight transition, click on already-focused piece,
   count of one, duplicate configured positions, unrecognised finish name, absent optional metadata,
   extreme window sizes, reduced-motion preference.

6. **Ambiguous phrase in FR-004.** "Contiguously numbered" was tightened to require the derived
   numbering to be correct after both increments and decrements of the configured count.

### Cross-checks against the constitution

- **Principle I (Simplicity/YAGNI)** — no state-management library, no asset pipeline, no editor
  state, no backend. Scope held to one viewer and one configuration file.
- **Principle II (Test-First)** — **FR-021** through **FR-023** make automated verification of
  configuration a first-class requirement. Without them the pedagogical goal is unenforceable.
- **Principle IV (Configuration Over Code)** — **FR-003**, **FR-004**, **FR-005**, **FR-006** are
  the direct expression of this principle.
- **Technology Constraints** — the stack is deliberately absent from this spec. It is recorded once
  in the constitution rather than restated, so there is a single place to change it.

### Not blocking, but carried into planning

- **FR-012** (retarget mid-transition) is a real behaviour requirement but small. If planning finds
  it inflates the camera work, it is the first candidate to defer — it must then be removed from
  the spec rather than silently unimplemented.
- Image support (**FR-017** through **FR-023**) is scoped as capability, not as shipped content. No
  binary assets are required to satisfy it, since the fallback path is the initial state.

---

## Re-validation after clarification session (2026-09-30)

**16/16 → 19/19 items passing. No regressions.**

Three items were added and immediately pass, because the clarification session created the evidence
they check for:

- *Out-of-scope items are declared explicitly* — a dedicated `## Out of Scope` section now records
  ten exclusions. Previously the checklist item "Scope is clearly bounded" passed only because
  nothing contradicted the spec; nothing stated what was excluded. That was the weakest pass in the
  set.
- *No requirement contradicts another* — FR-011 and FR-013 were mutually unsatisfiable until the
  reduced-motion question resolved it. The checklist passed this before it was asked.
- *Ambiguous precedence between competing rules is resolved* — FR-021 now defines a single
  two-level precedence rule for surfaces, replacing two requirements that could each claim to be
  the winner.

### Structural changes from the session

- **FR renumbered** from 27 to 35 requirements. Three surface-precedence requirements were inserted
  mid-list, and the environment chain added five. All ids are contiguous 1–35 with no duplicates.
- **SC extended** from 12 to 15, adding three outcomes for the environment chain.
- **`## Clarifications` section added** with a dated session record of all five answers.

### Items to re-check if the spec is amended again

- SC-009 ("typical student laptop") remains unquantified. It was not worth one of the five-question
  budget; if the target hardware for the course becomes concrete, tighten this to a named baseline
  device.

---

## Second re-validation — Codio and the course topology (2026-09-30)

**19/19 still passing, but two items had been passing for the wrong reason and were rewritten.**

### What prompted this round

A clarification arrived after the first session closed: the development environment is a **Codio
sandbox**, and students are **collaborators on one public repository** submitting to a **shared
staging branch** without a reset between submissions. Production deploys from `main`, and only the
instructor merges.

### Two checklist items that had been lying

- *No requirement contradicts another* passed while the spec said "student work lives in their own
  clone and their own commits" and "sharing between students is out of scope". Both contradicted the
  actual course topology. This item had been earned by a first round in which the topology was
  never asked about, which is exactly the failure mode this checklist exists to catch.
- *All functional requirements have clear acceptance criteria* passed while SC-014 promised a
  student could promote to production. FR-040 says only the instructor may. The success criterion
  was false, not merely untestable.

The general lesson: this checklist verifies internal consistency, and it had been passing on a spec
that was internally consistent and externally wrong. An item cannot detect a fact it was never
given.

### Four requirements were removed rather than amended

The concurrency model was decided after several drafts were written for a different one. Those
drafts were false under the chosen model and were deleted instead of being softened:

- "no student can observe or overwrite another student's unfinished work" — false, a push replaces
  the previous submission
- "the staging branch MUST be returned to a known baseline" — the model explicitly has no reset
- "returning staging to baseline MUST NOT affect production" — no longer had a subject
- "every student starts from identical exhibition content" — false without a reset

They are replaced by **FR-036** through **FR-041**, which state the cost of the shared branch
outright: a submission is ephemeral in staging, and the gallery on screen may belong to somebody
else. **SC-017** makes that a stated expectation rather than a discovery.

### Structural changes

- **FR renumbered** 35 → 44. All ids contiguous 1–44, no duplicates. Three duplicate ids introduced
  mid-edit were caught and removed before commit.
- **SC extended** 15 → 18. All ids contiguous 1–18.
- **`## Assumptions`** gained the shared-branch trade-off, recorded as a deliberate teaching
  constraint rather than an oversight.
- **`## Out of Scope`** rewrote two entries that had become false: per-student persistence, and
  collaboration between students.

### Open, not blocking

- SC-009 remains unquantified, as above.
- The constitution fixes the stack but names no operating system, and the development environment is
  now known to be Linux. The assumption is recorded in the spec; the constitution is silent on it.
