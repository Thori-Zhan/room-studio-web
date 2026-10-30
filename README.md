# Room Studio

Public static application only. Personal photos, address references and original property plans are excluded. Layouts and selected photos remain in each visitor's browser.

## Design workspace

`design.html` reuses the measured planner with a separate `pearl-room-design-v1` storage namespace and independent named slots. It initially copies the current room if available, preserving the original room and its saved layouts. The two memo boards, unknown outlet positions and per-device power assignments are part of each design.

`design-core.js` normalizes design data, checks fixed furniture dimensions, estimates cable reach along the north/west/south perimeter (never the unpowered east wall), and assigns a layout fingerprint. These checks do not certify electrical safety, ergonomic clearance or heater operating clearance. Socket positions start unknown; no coordinates are fabricated.

The preview step downloads a local ZIP with layout, checks, prompt, a floor plan, and four directional 2.5D SVG/PNG guides. Optional reference photos are included only when selected. Image generation happens in the chat, not automatically in the static page. Associated images stay in browser IndexedDB and are labelled stale when the design fingerprint changes. No API credentials or private reference photos are deployed.

`preview.html?workspace=design` reads the design workspace and includes its memo boards. Standard `preview.html` continues to read the original room. The door is in the end wall opposite the window; the open leaf rests along the right sidewall. The outer room is rectangular without an entrance recess.

The design workbench includes editable concept layouts with non-mutating, four-angle 2.5D and plan previews. Starting one saves an automatic backup and creates a separate named scheme. Geometry is checked against the currently calibrated room; these are placement drafts, not heater operating approval.

Revision 2026-10-31: B is withdrawn and C is revised after a cabinet-use conflict. A's two small drawer units now face into the room. The workflow is concept preview, dimension/use checks, then realistic and 2.5D outputs from the same layout. Cabinet front zones rotate with each cabinet and show blocked regions in red; drawer travel and reserved standing space can be edited in the cabinet inspector. MALM's recorded drawer travel is 27cm; other drawer travel starts as an estimate. Standing space defaults to 45cm. These values, a 20cm chair-back observation area, a 60cm wardrobe-front observation area and the raster 40cm window route are planning assumptions, not ergonomic or operating-clearance certification. Image generation still occurs in chat. Unmeasured electrical reach and heater operating clearances remain unverified.

`design-products.json` records a small source-verified Australian product catalog and verification date. The design library imports assembled dimensions, retains source links, distinguishes modified dimensions/colors from original specifications, and stores custom products under `pearl-room-design-products-v1`. Unused custom library entries stay in this browser; layout exports retain products actually placed in the room. Arbitrary retailer URL extraction is not implemented; recognized catalog URLs load existing verified records, and other links are explicitly marked unrecognized. Retailer searches open the merchant search page.
