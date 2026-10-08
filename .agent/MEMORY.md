# Memory: RakshaLink (update at every gate)

## Status (3 Oct 2026)
- Planning done. No product code written (rule: code and designs must be created in the 8-hour window on 8 Oct).
- Event: Thu 8 Oct 2026, GNIT Sodepur, 10:00 to 18:00 IST on Devfolio (site says gates 09:00).

## Decisions (and why)
- Tiers T1/T2/T3 with hard gates. Why: 8 hours, 4 people, big ambition.
- Crash countdown 20 s, one config value. Why: matches the teammate's design, shorter wait in a demo.
- Call 112 is filled red, opens the dialer on tap only. Why: clearest for panicked users.
- `PROVIDER=mock|twilio`. Why: carrier and DLT issues must never break the demo. Mock is labelled.
- PostGIS 20-minute rule, otherwise haversine. Why: setup risk.
- Demo location override with two presets. Why: indoor GPS is unreliable.
- Responder data from OSM, phones are demo numbers, console says "SIMULATED RESPONDER NETWORK".
- Accident dispatches hospital and police. Offline = SMS fallback then Morse + queue.
- Never claim help is coming unless a responder accepted.

## Open decisions
- Which track to enter. Judging criteria (read FAQ 10). Devfolio submission requirements.
- Whether AI coding assistants, templates, and design tools are allowed inside the window.
- Roles A to D: who is who.

## Risks
Scope, carrier delivery, venue Wi-Fi, torch/sensor access in Expo Go, time lost to setup.

## Gate log
(append: time, gate, pass/fail, real output)

## Update: Responder Console v2 (3 Oct)
- Console follows a driver-app workflow: On duty toggle, ringing alert with countdown, Accept / Can't respond, On the way, Arrived, Resolved. Role views per responder type. Desktop prompts: STITCH_DESKTOP_PROMPT.md.
- Tiers: console core T1; duty, status progression, role views T2; ETA estimate, history, operations overview T3.
- Rule R15: statuses only from responder actions, ETA only if the responder typed it, no other brand's visuals, no rider phone numbers on the console.

## Update: timing correction (7 Oct)
- The conversation ran 3 to 7 Oct. Today is 7 Oct, so the event is TOMORROW (8 Oct, 10:00). Earlier "five days" statements were stale. 00_START_HERE.md now has a TONIGHT checklist.

## Final status (7 Oct, night before)
- Specs final. Responder UI state table in DESIGN.md section 15 overrides any mockup. API contract in repo/docs/API_CONTRACT.md. One-page runbook: DAY_OF_RUNBOOK.md.

## Update: design tokens locked (7 Oct)
- DESIGN_TOKENS.md (user's design file) is the token source of truth: Noto Serif 600 headlines, DM Sans body, 12 px card radius, no gradients, error red #BA1A1A, amber #D9B25C demo banner. Responder screens: STITCH_RESPONDER_FINAL_PROMPT.md and responder_reference/.

## Update: finalized for the event (7 Oct)
- Playbook (TOMORROW_PLAYBOOK.md), role prompts (AGENT_PROMPTS.md) and Devfolio text (DEVFOLIO_SUBMISSION.md) written. Repo README upgraded with a design gallery and comparison table.
- The Stitch export still contained invented content (incident IDs, unit numbers, telemetry, ETA wording). Strip list lives in AGENT_PROMPTS.md.


## Gate Update: G1 & G2 Complete
All roles (Server, Web Console, Mobile App) have been fully built for Tier 1 in the isolated deployable directory (rakshalink-app). End-to-end flow tested including Manual SOS, Auto Crash with 20s countdown, Web Console map tracking, dynamic responder fetching, and status synchronization via SSE.
