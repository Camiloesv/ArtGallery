# Specification Quality Checklist: Exhibition Viewer

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-30
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

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
- Image support (**FR-017** through **FR-020**) is scoped as capability, not as shipped content. No
  binary assets are required to satisfy it, since the fallback path is the initial state.
