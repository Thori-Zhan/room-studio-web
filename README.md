# Room Studio

Public static application only. Personal photos, address references and original property plans are excluded. Layouts and selected photos remain in each visitor's browser.

## Design workspace

`design.html` reuses the measured planner with a separate `pearl-room-design-v1` storage namespace and independent named slots. It initially copies the current room if available, preserving the original room and its saved layouts. The two memo boards, unknown outlet positions and per-device power assignments are part of each design.

`design-core.js` normalizes design data, checks fixed furniture dimensions, estimates cable reach along the north/west/south perimeter (never the unpowered east wall), and assigns a layout fingerprint. These checks do not certify electrical safety, ergonomic clearance or heater operating clearance. Socket positions start unknown; no coordinates are fabricated.

The preview step downloads a local ZIP with layout, checks, prompt, a floor plan, and four directional 2.5D SVG/PNG guides. Optional reference photos are included only when selected. Image generation happens in the chat, not automatically in the static page. Associated images stay in browser IndexedDB and are labelled stale when the design fingerprint changes. No API credentials or private reference photos are deployed.

`preview.html?workspace=design` reads the design workspace and includes its memo boards. Standard `preview.html` continues to read the original room. The door is in the end wall opposite the window; the open leaf rests along the right sidewall. The outer room is rectangular without an entrance recess.
