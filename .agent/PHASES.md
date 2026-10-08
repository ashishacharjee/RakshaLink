# PHASES: the 8-hour battle plan (Thu 8 Oct 2026)
Clock: T+0:00 = 10:00 AM. If gates open earlier, use the extra time for setup and questions only.
Everything below is created inside the window (RULES R12).

## Roles (assign by strength)
| Role | Owns | Folder |
|---|---|---|
| A: Lead / integrator | API contract, integration, deck, pitch, README, Devfolio submission, demo owner | `/docs` |
| B: Backend / data | Express, DB, seed data, triage, dispatch, SSE, escalation | `/server` |
| C: Mobile | Expo app: Home, status, countdown, crash detector, offline | `/mobile` |
| D: Web / design | Responder Console, accept page, Stitch screens (or the Stitch export), visual polish | `/web` |
Each person works only in their own folder (fewer merge conflicts). Anything shared goes through the API contract.

## Tiers
**T1 (must work end to end):**
- Backend: `POST /api/sos`, triage rules, nearest-responder match (PostGIS or haversine), dispatch behind `PROVIDER=mock|twilio`, status API, SSE stream, accept/decline endpoints, demo reset.
- Seed responders from OpenStreetMap near two presets (GNIT campus; an NH-19 sample point).
- Responder Console (desktop) and the SMS accept page.
- Mobile: Home (4 tiles, location card with preset switch, Call 112), real status screen, Drive Mode card with **Simulate crash** then a 20 s countdown then automatic accident SOS.

**T2 (only after the T1 gate passes):** auto-escalation, responder status progression (On the way, Arrived, Resolved), On Duty toggle, role views, offline ladder (Morse + queue + prefilled-SMS fallback), real crash detector with replayed traces, family alert, time-to-dispatch metric.

**T3 (only if ahead):** Voice SOS, responder History and Operations overview, responder ETA estimate, language toggle, Share button, History/Settings/Location tabs, map polish, bystander mode, n8n or other sponsor tooling.

## Schedule and gates
| Time | Gate | Pass condition |
|---|---|---|
| 10:00 to 10:45 | **G0 Setup** | Repo and folders. Start from `docs/API_CONTRACT.md` (already drafted). Agree any changes in the first 15 minutes. Everyone can run hello-world on phone and laptop. DB decision made: PostGIS must work in 20 minutes, otherwise haversine |
| 10:45 to 12:00 | **G1 Parts exist** | B: curl returns matches. D: console shows a fake event. C: Home renders on the phone. A: deck outline started |
| 12:00 to 13:00 | **G2 End to end v0** | Tap on the phone, the alert appears on the console, Accept, the phone timeline updates (mock provider is fine) |
| 13:00 to 14:00 | **G3 T1 complete** | Simulate crash to countdown to auto SOS works. Real SMS reaches a team phone, or we stay on mock after 30 minutes of trying. Take turns to eat |
| 14:00 to 15:30 | **G4 T2** | Escalation, then offline ladder, then crash detector. Cut anything unfinished at 15:30 |
| 16:00 | **G5 FEATURE FREEZE** | No new features. Bug fixes only |
| 16:00 to 17:30 | **G6 Finish** | Demo script run 3 times in a row. 2-minute backup video recorded. README, deck updated, Devfolio submitted |
| 17:30 to 18:00 | Buffer | Fix, charge, relax |
If a gate is missed by more than 30 minutes, cut the next tier item, not the sleep or the rehearsal.

## Cut order (first cut first)
Operations overview, responder history, ETA estimate, Voice, language toggle, History/Settings tabs, Share, bystander, map polish, family alert, metric, real crash detector (keep the simulate button), offline ladder (keep Morse screen only), escalation. **Never cut:** the T1 list, the console, the accept page, the rehearsal, the backup video.

## Demo script (under 4 minutes)
1. Problem, one verified MoRTH number (20 s).
2. Medical SOS on the phone, the alert pops on the laptop console, a teammate's phone gets the SMS (60 s).
3. Accept on the console, the phone timeline updates (20 s).
4. Simulate crash, countdown, auto accident SOS to hospital and police (40 s).
5. Ignore one alert, escalation fires (30 s, if built).
6. Airplane mode, Morse, queue, delivered (30 s, if built).
7. Honest limits and roadmap (20 s).

## Agent working rules
Contract first. One folder per person. Small commits to `main`. Run it before saying it works. Update MEMORY.md after each gate.
