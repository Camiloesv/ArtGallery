# Visitor Navigation Contract

This is a user-interface contract for the client-side gallery. The application exposes no public API.

## Number selector

- Provide one visible, accessible navigation selector with an English label.
- List exactly the configured painting numbers from 1 through the active count.
- Selecting a number focuses that painting with the existing smooth camera transition.
- The selector is navigation only. It does not change count, order, colour, wall finish, or artwork
  content.
- The selector works with keyboard, mouse, and touch input and remains usable at mobile, tablet, and
  desktop viewport sizes.

## Artwork selection and focus

- Clicking or tapping a visible painting focuses it.
- Selecting another painting while a transition is underway retargets smoothly to the new selection.
- From overview, Right focuses painting 1 and Left focuses the last configured painting. At row
  boundaries, Left/Right remain on the end painting. Up returns to overview.
- The focused view hides the overview title and instruction sign. Descriptive title, artist, year,
  and number remain attached to the 3D wall label.

## Overview pan

- Start in a closer panorama that frames a section of the exhibition, not the complete row at a
  distant scale.
- Horizontal pointer drag and touch swipe move the overview along the row.
- Movement is bounded by the first and last configured stations.
- A horizontal gesture must not trigger a painting tap/click. A tap/click without horizontal movement
  continues to select a painting or return from a focused view as specified.
- The numbered selector remains available as direct access to every configured station regardless
  of overview position.

## Responsive behavior

- The rendered gallery occupies the available viewport on phone, tablet, and desktop sizes.
- Canvas resizing must preserve usable artwork framing and selector access.
- The selector must remain visible and operable without obscuring the artwork being inspected.
