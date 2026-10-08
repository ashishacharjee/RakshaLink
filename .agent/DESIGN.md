# Design System — RakshaLink

**Visual source of truth:** the teammate's home-screen image (section 12) and the Stitch screens generated on event day. `rakshalink_ui_prototype.html` is an older sketch for flow and states only.
**Design intent:** *calm under stress.* Serious enough to trust in an emergency, warm enough not to feel like a hospital form. The four brand colours from the deck double as the category language, so a user learns the colour once and it means the same thing everywhere.

## 1. Tokens
### Colour
| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | #EFEBDD | #0D140E | Page |
| `surface` | #FBF9F2 | #16201A | Screens, sheets |
| `ink` | #1C2A12 | #EEF0E4 | Text |
| `mute` | #5E6B57 | #9AA892 | Secondary text |
| `line` | green @14% | cream @12% | Borders |
| `green` | #274706 | same | Fuel, primary action, brand |
| `teal` | #1B4D4F | same | Breakdown |
| `navy` | #2B3A67 | same | Accident |
| `maroon` | #5B1F2D | same | Medical SOS |
| `purple` | #3D2A5C | same | Voice, progress, success |
| `amber` | #D9B25C | same | Offline / Morse only |
Hex values are read from the slides. Confirm with an eyedropper on the PPT and update here if any differ.

**Rules:** one category colour per screen (the active one). Tiles are always filled dark with cream text (contrast well above 4.5:1). Never use red/green alone to carry meaning. Pair colour with an icon and a label.

### Typography
- Display: **Noto Serif** 600/800 (echoes the serif headings in the deck). Screen titles 28/30, tile titles 17, quote 22.
- UI: **DM Sans** 400/500/700. Body 15/22, caption 12/16, overline 11 with +0.22em tracking in caps.
- Fallbacks: `Georgia, serif` and `system-ui, sans-serif`. In React Native, bundle both fonts with `expo-font` so nothing loads over the network mid-emergency.

### Spacing, shape, elevation
- 4 pt grid (4, 8, 12, 16, 20, 24). Screen padding 20.
- Radii (design file): cards and tiles 12, buttons 8 to 12, chips and pills fully round.
- Elevation: flat colours with 1 px soft borders. No gradient sheen (the design file defines none).
- Touch targets at least 56 pt for primary actions. Tiles are at least 150 pt tall.

## 2. Components
- **Category tile:** icon in a cream circle (icon in the tile colour), Noto Serif title, one-line hint ("Hospital + police"). Press state scales to 0.97 in 150 ms and fires a haptic.
- **Status chip:** pill with a pulsing dot (Online = green, SMS mode = amber, Offline = grey). The pulse is a 1.8 s ring.
- **Mic row:** dashed-outline card with a purple circular mic, plus a reassurance line ("We'll confirm before sending").
- **Call 112:** full-width filled red pill (flat #BA1A1A, white text, phone icon, "CALL 112 / Emergency Helpline"), always visible on Home and Status. Opens the dialer only on tap, never automatically.
- **Responder card:** coloured type pill, Noto Serif name, distance, and a `DEMO DATA` badge whenever the record is demo or seed.
- **Progress timeline:** three nodes (Alert sent, Responder notified, Responder accepted). A node fills purple when done and text goes from muted to ink.
- **Waveform:** 26 bars, staggered 70 ms, purple.
- **Morse strip + torch:** dots 14 px, dashes 42 px, amber glow when lit, matching the real timing (unit 300 ms).

## 3. Screens
1. **Home:** overline brand, two-line serif headline, status chip, location line, 2x2 tile grid, mic row, Call 112.
2. **Voice:** live waveform, transcript in large serif quote, guessed category card, `Yes, send` / `Change`. A low-confidence note is visible.
3. **Status:** category overline in its colour, headline, timeline, responder card(s). Accident shows two cards (hospital and police).
4. **Offline:** near-black warm background (saves battery, reads as "different mode"), torch orb with radiating amber rings, Morse strip, "Alert queued" card, and an honest sentence about what the signal does and does not do.

## 4. Motion
- Screen enter: 350 ms fade + 10 px rise. Timeline nodes fill in sequence. Waveform loops. Rings expand over 2.4 s.
- Respect reduced-motion. Decorative animation stops, but the Morse flash stays because it is the function.
- No motion longer than 400 ms on any path to sending an SOS.

## 5. Dark mode
Follows the system. Offline screen is always dark.

## 6. Accessibility
- TalkBack/VoiceOver labels on every tile ("Medical SOS, sends to nearest hospital").
- Haptic tick on send, distinct double-tick on "responder accepted".
- TTS reads the status changes aloud. Text scales with system font size without breaking the 2x2 grid (falls back to a single column above 130%).

## 7. Copy and honesty
- Plain, calm, short ("Help is being arranged").
- No invented ETAs. Show real distance or "unknown".
- Demo/seed data always carries the `DEMO DATA` badge.

## 8. Implementation notes (React Native)
- Tokens in `theme.ts`, consumed everywhere. No hard-coded hex in components.
- Gradients via `expo-linear-gradient`, haptics via `expo-haptics`, icons via `lucide-react-native` (Fuel, Wrench, TriangleAlert, Cross/Plus, Mic).
- Keep the animated parts on `react-native-reanimated` worklets so the UI stays smooth while GPS and network work runs.
- Build the Home and Status screens first, since they carry the whole demo.

## 9. Addendum: Crash countdown screen (see prototype "Crash" tab)
- Full-bleed deep maroon (#5B1F2D) (the one screen allowed to be loud). Overline "CRASH DETECTED", serif headline "Are you OK?".
- Large circular countdown ring (20 s, cream stroke draining) with the seconds in 56 px Noto Serif at the centre.
- One explanatory line: what was sensed and what happens at zero.
- Two buttons: **I'm OK** (primary, large, cream) and **Send help now** (outlined).
- Siren + continuous haptics. The screen wakes the device and shows over the lock screen where the OS allows.
- Home gets a small Drive Mode card ("auto-alert if a crash is detected") with a dev-only `Simulate crash` action.
- After send, the Status screen is reused. The overline reads "ROAD ACCIDENT" and the copy says "Automatic crash alert".

## 10. Addendum: Responder accept page and status honesty
- Mobile web page (opens from the SMS): overline "INCOMING ALERT", serif headline, category pill in its colour, an "AUTOMATIC CRASH ALERT" tag when applicable, distance, a map block with a maroon pin, and two big buttons (Accept / Can't respond). Same tokens as the app. See the "Responder" tab in the prototype.
- Status screen steps fill only on real events. If no one answers: headline "No responder answered", the Call 112 button becomes filled maroon, and family contacts are shown as alerted.

## 11. Addendum: Responder Console (desktop)
- Same tokens as the app. Green header bar with "RAKSHALINK · RESPONDER CONSOLE", a "Signed in as <responder> (demo)" chip, and a DEMO banner.
- Two columns: left alert queue (cards with category pill, AUTOMATIC CRASH ALERT badge, distance, time since alert); right detail (serif headline, map block with maroon pin, big Accept and outlined Can't respond, escalation countdown "Escalates to next responder in 20s").
- Bottom event log (newest first). Arrival of a new alert plays a short chime and pulses the card once. Respect reduced motion.
- See the "Console" tab in the prototype.

## 12. Addendum: teammate's reference design (home screen image)
A teammate suggested a home-screen design (image) that is now the visual reference for the app UI. Its main features: serif app name + friendly tagline; Online and "Offline Beacon Ready" pills; a location card with accuracy chip and Share; 2x2 gradient category tiles with a distance chip, watermark illustration and chevron; a Drive Mode card with a toggle; a lavender "Speak for Help" card with an AI TRIAGE chip; a full-width filled red **Call 112** button; a 4-tab bar (Home, Location, History, Settings).
- This supersedes section 2's outlined Call 112 pill: use the **filled red** button (still opens the dialer only on tap).
- Copy must follow `STITCH_PROMPT.md` Part 3 (no NHAI claim, no "en route", no "dispatches in seconds").
- The HTML prototype uses the older style. Restyle it to match this reference if you want the live prototype to look identical.
- Decided: countdown is 20 s.

## 13. Timing note
Design is created inside the event window. Use `STITCH_PROMPT.md` on the day (Role D). Until then it is only a text prompt.

## 14. Addendum: Responder Console (desktop)
Full prompts in `STITCH_DESKTOP_PROMPT.md`.
- Canvas 1440 x 900, light warm background, deep-green top bar. Three columns: alert queue (320 px), map (flexible), alert detail (380 px). Slim left sidebar (Live alerts, Map, History, Settings) and a stats strip.
- Top bar: logo, organisation name and role chip, On duty toggle, DEMO chip, clock.
- States: empty (on duty), incoming (pulsing banner in category colour, large countdown), accepted (four-step progress bar with one primary next-step button), resolved, off duty.
- One dominant element per state: the active alert and its Accept button.
- Optional dark control-room theme for the operations overview.
- Rule: no other brand's visuals. The Captain idea is a workflow, not a look.

## 15. FINAL: responder UI state spec (this overrides any mockup)
One state per screen. Same rules on desktop and mobile.
| State | Banner | Buttons | Countdown | Progress | Event log adds |
|---|---|---|---|---|---|
| S0 Incoming | none | Accept and Can't Respond active. All step buttons and Update disabled | visible, running | Notified checked, nothing else | up to "Responder notified" |
| S1 Accepted | "Alert accepted" | Accept, Can't Respond and countdown gone. Only "On my way" enabled | hidden | + Accepted | "Alert accepted" |
| S2 On the way | "On the way" | Only "Arrived" enabled | hidden | + On the way | "On the way" |
| S3 Arrived | "Arrived" | Only "Resolved" enabled | hidden | + Arrived | "Arrived" |
| S4 Resolved | "Resolved" | All disabled, "Back to alerts" shown | hidden | all checked | "Resolved" |
| Declined or missed | none | alert leaves the queue, escalates | n/a | n/a | "Declined" or "No response, escalated" |
| Taken by another | queue row says "Accepted by another responder" | read-only | n/a | n/a | n/a |
Rider timeline mapping: S0 shows "Alert sent, Responder notified"; S1 "Responder accepted"; S2 "On the way" (plus "Responder's estimate" only if typed); S3 "Arrived"; S4 "Resolved".
Other final rules: no computed ETA anywhere (distance is straight-line), the trigger badge always matches the trigger (crash_auto shows "Automatic crash" and is a Road Accident), no rider personal data, demo banner is amber, sidebar has Home only (History, Profile, Settings read "Coming soon").

## 16. Token source of truth
`DESIGN_TOKENS.md` (the attached design file, theme "RakshaLink Warm Calm Light") overrides every colour, font and radius above. Headlines use Noto Serif 600 (the file's `display: Fraunces` entry conflicts with its own type scale, so Noto Serif is used). Call 112 and all urgent actions use error red #BA1A1A. The responder screens are specified in `STITCH_RESPONDER_FINAL_PROMPT.md` with reference images in `responder_reference/`.
