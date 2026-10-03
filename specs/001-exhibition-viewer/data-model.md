# Exhibition Viewer Data Model

This document maps the specification's concepts for planning and validation. The authoritative
serializable configuration schema remains in `src/config/exhibition.ts`, where the constitution
requires it to be documented alongside its declaration. Do not maintain a second editable schema
here.

## Exhibition

The single gallery rendered by the application.

| Attribute | Meaning / rule |
|---|---|
| `count` | Positive integer not greater than the configured station list; starter value is 25. |
| `spacing` | Distance between adjacent stations; used to derive their row positions. |
| `surfaceResolution` | Configured texture dimensions; current default is 512 by 512. |
| `stations` | Ordered station records; each has one wall and one framed artwork. |

The starter data has exactly 25 stations. The selector lists exactly the stations available after
configuration validation, so changing `count` cannot leave links to nonexistent works.

## Station

One numbered position in the row.

| Attribute | Meaning / rule |
|---|---|
| `id` | Stable unique configuration identity. |
| `position` | Numeric station position used to place and focus the work; duplicate positions are invalid. |
| Display number | Derived from station order as one-based numbering from 1 through the configured count. |
| `title`, `artist`, `year` | Optional description rendered in the 3D wall label. |
| `wall` | Independent wall-panel configuration for this station. |
| `painting` | Framed artwork configuration for this station. |

## Wall panel

One independently configured surface behind a station's artwork.

| Attribute | Meaning / rule |
|---|---|
| `color` | Configured fallback/base colour. Each starter wall uses a distinct shade of white. |
| `roughness` | Material surface property. |
| `finish` | Named generated appearance; unknown names use the specified matte fallback. |
| `image` | Optional local image path and aspect data; takes precedence over generated finish. |

## Painting

One framed work displayed in front of a wall panel.

| Attribute | Meaning / rule |
|---|---|
| `color` | Flat fallback/base colour. |
| `image` | Optional local image path and aspect data; fit without distortion and use colour fallback on failure. |

## View and navigation state

Runtime state is not persisted and is not part of the exhibition configuration.

| State | Meaning / rule |
|---|---|
| Focused station | A configured station selected by click/tap, number selector, or arrow keys. |
| Overview | No focused station; camera frames a nearby section of the row. |
| Horizontal overview offset | Camera location along the row, clamped to the first/last station bounds. |
| Selector value | A configured station number; options match the current configured count. |

Pointer drag or touch swipe moves the overview offset. A tap/click selects a painting; gesture
recognition must keep horizontal movement from accidentally selecting a work.

## Validation rules

- `count` is positive and no greater than the configured stations.
- Station identities and positions are unique; displayed numbering is contiguous.
- Starter wall colours are unique white shades; changing one wall leaves the others unchanged.
- Selector options exactly equal configured station numbers.
- Missing or undecodable images affect only their own surface fallback.
- Overview movement is bounded and does not alter exhibition configuration.
