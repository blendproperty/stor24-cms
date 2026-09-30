# STOR24 CMS identity

The approved public website is the source of truth. CMS branding must use its
actual supplied assets, never a text recreation or an independently drawn logo.

- `public/brand/stor24-logo-official.svg` is copied byte-for-byte from
  `blendproperty/stor24` → `public/brand/stor24-logo-transparent-white.svg`.
  Native proportions: 611 × 160. SHA-256:
  `221c75f75e50f92f1a3952cddff17c31d58655a323d437c5c78b2fe156793de8` (repository / deployed LF bytes).
- `public/brand/Satoshi-Variable.woff2` is the unmodified official Fontshare
  Satoshi variable font, weights 300–900. Its actual `wght` axis was verified.
  SHA-256: `e739aff9b4d02c264341d6d4872edcda28e79373aeda936f659566a1cd3eb47f`.
  Source: https://api.fontshare.com/v2/css?f[]=satoshi@variable&display=swap
  Downloaded 30 September 2026 from the normal variable face in that stylesheet.
  The old website file named Satoshi-Variable.ttf was inspected and is a static
  Bold instance with no variable axis; it is not used for CMS body text.
- The complete white logo sits on ink; retain its native orange artwork without
  recolouring, rearranging, filtering or replacing the hexagon or superscript.
- Shared interface colours: ink `#071411`, cream `#F5F3EA`, orange `#FF5A0A`.
  Orange identifies actions and active navigation. Keep semantic status colours.
- Voice: calm, useful and direct. “Life happens. We’ve got room.” is the brand
  idea. Use personality in content planning, precise language for account actions.
- Shared components and the Payload stylesheet cover login, navigation, lists,
  editing, homepage settings and account screens.

## Content ideas

`content-ideas` is an internal, authenticated collection. It stores working
titles, target search phrases, audiences, writing briefs, research, formats,
priorities, planned dates and progress. A status change does not publish website
content. Published material is created in the existing website collections and
its URL can then be recorded on the idea. Search demand must be checked in Search
Console; never invent search volumes or ranking evidence.
