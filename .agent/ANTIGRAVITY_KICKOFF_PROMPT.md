# RakshaLink: coding agent kickoff (paste on event day only, after 10:00 on 8 Oct 2026)

You are helping Team InitToWinIt build **RakshaLink** at the Recursive hackathon. The window is **8 hours**. All code must be written during it. Read `00_START_HERE.md`, `RULES.md`, `PRD.md`, `ARCHITECTURE.md`, `PHASES.md`, `DESIGN.md`, `MEMORY.md` first, then restate the plan in 10 lines.

**Your scope this session:** work ONLY in the folder I name below (`/server`, `/mobile`, or `/web`). Do not edit other folders. Shared data shapes live in the API contract (`docs/API_CONTRACT.md`, adjust it together and keep it in sync).
**My role:** [A | B | C | D]  **My folder:** [/docs | /server | /mobile | /web]

## What we are building
RakshaLink is a highway emergency app. A person taps one of four emergencies (Fuel, Breakdown, Accident, Medical) or the phone detects a crash. A triage agent picks the right responder type, finds the nearest one, dispatches by SMS and voice, waits for an accept, and escalates to the next-nearest if nobody answers. A desktop Responder Console and a mobile accept page show the responder side. Offline: prefilled SMS, then a Morse flash with a queue.

## Non-negotiable rules (full list in RULES.md)
1. **No fabrication.** No invented stats, partnerships, phone numbers, response times, or test results. Unknown means "unknown" or "DEMO DATA".
2. **No real emergency contact.** `DEMO_MODE=true`. SMS and calls go only to whitelisted team numbers. Never auto-dial 112. A manual Call 112 button only.
3. **Never say help is coming unless a responder accepted.** If nobody answers: "No responder answered. Call 112."
4. **Mock dispatch is labelled** "SIMULATED DISPATCH". Never present it as a real SMS.
5. **Triage is deterministic and tested.** medical gives hospital; accident gives hospital and police; breakdown gives mechanic; fuel gives fuel_pump. Any LLM output is validated against the four values.
6. **Crash detection** needs speed context, impact, and a sudden stop. It never fires on one spike. 20 s countdown with a loud alarm and a big "I'm OK" button. No accuracy claims.
7. **No dead UI.** Hide or label "Coming soon" anything not wired.

## Build order (PHASES.md)
T1 first (SOS, matching, dispatch with `PROVIDER=mock|twilio`, status, console, accept page, simulate-crash). T2 only after the T1 gate. T3 only if ahead. Cut order is in PHASES.md.

## Stack and fallbacks
Node + Express + Postgres/PostGIS (20-minute rule, otherwise in-memory haversine), Expo React Native (verify which modules work in Expo Go before adding a native dependency), a plain web page for the console and accept page with Server-Sent Events. Seed responders from OpenStreetMap Overpass near two presets (GNIT campus 22.6951, 88.3788, and an NH-19 sample point chosen from a map and labelled sample). Show "© OpenStreetMap contributors".

## UI
Match the reference home-screen image and the Stitch screens. Category colours: Fuel green, Breakdown teal, Accident navy, Medical maroon. Call 112 is a filled red button. Big targets, plain words.

## Responder Console (Captain-style workflow)
Build the desktop console as in `PRD.md` section 10 and `ARCHITECTURE.md` (Responder Console v2). T1: alert queue, map with rider pin, detail panel, Accept / Can't respond, escalation countdown. T2: On duty toggle (off-duty responders are skipped by matching), status steps On the way, Arrived, Resolved set only by the responder (rider timeline shows each real step), role views via a DEMO-only "view as" selector. T3: ETA estimate typed by the responder, history, operations overview. Never auto-advance statuses, never show a computed ETA or a rider phone number (`RULES.md` R15). UI reference: `STITCH_DESKTOP_PROMPT.md`. The responder state table in `DESIGN.md` section 15 is the final spec and wins over any mockup.

## Stitch UI export
If `/web/design` (or a Stitch export) exists, use it ONLY as markup and styling. Replace every hard-coded string with real data from the API, and remove the invented content listed in `AGENT_PROMPTS.md` (Stitch strip list): incident IDs, unit numbers, telemetry text, ETA wording, extra incident types, profile menus and non-OpenStreetMap maps. The state table in `DESIGN.md` section 15 wins over any picture.

## How to work
Run it before claiming it works. Paste real output in `MEMORY.md`. Update `MEMORY.md` at each gate. If you must choose between polish and a working end-to-end demo, choose the demo. Begin with Gate G0 for my role.
